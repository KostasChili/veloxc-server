const User = require("../models/User");
const Shop = require("../models/Shop");
const Appointment = require("../models/Appointment");
const asyncHandler = require("express-async-handler");
const { addMinutes, getTime, format } = require("date-fns");
const nodemailer = require('nodemailer');
const transporter = require('../config/transporter');

//@desc public route to create Appointments
//@route POST shops/public/appointmens
//@access public

const createAppointment = asyncHandler(async (req, res) => {
  const { id, customerName, service, date, startTime, email, comments } =
    req.body;
  if (!id || !customerName || !service || !date || !startTime || !email) {
    return res.status(400).json({ message: "All fields required" });
  }
  const shop = await Shop.findById(id).populate("appointments");

  if (!shop) return res.status(400).json({ message: "No shop found" });

  var tempDate = date.split("-");
  let tmp;
  tmp = tempDate[2];
  tempDate[2] = tempDate[0];
  tempDate[0] = tmp;
  tempDate = tempDate.toString().replaceAll(",", "-");
  console.log;

  const temp = tempDate.split("-");

  if (temp[1].length === 1) temp[1] = "0" + temp[1];
  if (temp[2].length === 1) temp[2] = "0" + temp[2];
  const formDate = temp.join("-");

  const appDate = new Date(`${formDate}T${startTime}`);

  const endDate = addMinutes(appDate, 30);

  const endTime = format(endDate, "HH:mm");

  const appointmentObj = {
    shopId: id,
    customerName,
    service,
    date: formDate,
    comments: comments ? comments : "",
    startTime,
    endTime,
    email,
  };

  const appointment = await Appointment.create(appointmentObj);
  if (!appointment) return res.status(400).json({ message: "invalid data" });
  await shop.appointments.push(appointment);
  const shopRes = shop.save();
  if (!shopRes)
    return res.status(400).json({ message: "error saving in shop" });

//send email for verification
let mailTemplate=  `Καλησπέρα, Έιστε ένα κλικ μακρία από την επιβεβαίωση του ραντεβού σας στο κατάστημα
${shop.title}, στης ${date} και ώρα ${startTime}-${endTime} για την υπηρεσία ${service}. Τα σχόλια σας για το ραντεβού σας είναι :
${comments}.Παρακαλούμε για την επιβεβαίσση του ραντεβού σας πατήστε τον παρακάτω σύνδεσμο.
localhost:5000/appointments/verification/${appointment._id}
Με εκτίμηση 
Η ομάδα του Velox Constitutio
@VeloxC`

// let emailHtml = `${<link href="localhost:5000/appointments/verification/${appointment._id}"><button>Επιβεβαίωση Ραντεβού</button></link>}`
let info = await transporter.sendMail({
  from: '"VeloxC - Appointment-Confirm-Service" <appconfirm@veloxc.com>', // sender address
  to: email, // list of receivers
  subject: "Επιβεβαίωση Ραντεβού", // Subject line
  text: mailTemplate, // plain text body
  //  html: emailHtml, // html body
});
console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  res.json({ message: "Appointment created" });
});

const retrievePublicAppointments = asyncHandler(async (req, res) => {
  //get thei id from the requrl
  const { pathname } = req._parsedOriginalUrl;
  //params are empty because of the way the router is set TODO -> implement it in a way that params worked. Found and solved this problem on verificationsController
  const parsedData = pathname
    .replace("/shops/public/appointments/", "")
    .split("/");
  const id = parsedData[0];
  const date = parsedData[1];
  if (!id) return res.status(400).json({ message: "shop id required" });
  const shop = await Shop.findById(id).populate("appointments");
  if (!shop) return res.status(400).json({ message: "no shop was found" });
  if (!shop.appointments)
    return res.status(204).json({ message: "no appointments where found" });
  const appList = [];
  //Create time slots
  //This should be implemented on the shop side on the shop creation and update
  //and stored in the shop model in order to avoid the calculation every time an appointment is made
  const [hourOp, minuteOp] = shop.opensAt.split(":");
  const [hourCl, minuteCl] = shop.closesAt.split(":");
  const totalSlots = Number.parseInt(hourCl) - Number.parseInt(hourOp);
  let allTimeSlots = [];
  const parsedOpening = parseInt(hourOp);
  const createTimeslots = () => {
    for (let i = 0; i < totalSlots; i += 0.5) {
      if (Number.isInteger(i)) {
        if (i + parsedOpening < 10) {
          allTimeSlots.push(
            `0${i + parsedOpening}:00-0${i + parsedOpening}:30`
          );
        } else if (i + parsedOpening >= 10) {
          allTimeSlots.push(`${i + parsedOpening}:00-${i + parsedOpening}:30`);
        }
      } else {
        let tempFloor = Math.floor(i);
        let tempCeil = Math.ceil(i);
        if (i + parsedOpening < 10) {
          `0${tempFloor + parsedOpening}:30-0${tempCeil + parsedOpening}:00`;
        } else {
          allTimeSlots.push(
            `${tempFloor + parsedOpening}:30-${tempCeil + parsedOpening}:00`
          );
        }
      }
    }
  };
  createTimeslots();

  const tempDate = date.split("-").reverse();
  if (tempDate[1].length === 1) tempDate[1] = "0" + tempDate[1];
  if (tempDate[2].length === 1) tempDate[2] = "0" + tempDate[2];
  const formDate = tempDate.join("-");

  shop.appointments.map((app) => {
    if (app.date === formDate) {
      appList.push({
        date: app.date,
        startTime: app.startTime,
        endTime: app.endTime,
      });
    }
  });
  res.json({ appList, allTimeSlots });
});

module.exports = {
  createAppointment,
  retrievePublicAppointments,
};
