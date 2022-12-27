const User = require("../models/User");
const Shop = require("../models/Shop");
const Appointment = require("../models/Appointment");
const asyncHandler = require("express-async-handler");
const { addMinutes, getTime, format } = require("date-fns");

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

  var formDate = date.split("-");
  let tmp;
  tmp = formDate[2];
  formDate[2] = formDate[0];
  formDate[0] = tmp;
  formDate = formDate.toString().replaceAll(",", "-");

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
    active: true,
  };

  const appointment = await Appointment.create(appointmentObj);
  if (!appointment) return res.status(400).json({ message: "invalid data" });
  await shop.appointments.push(appointment);
  const shopRes = shop.save();
  if (!shopRes)
    return res.status(400).json({ message: "error saving in shop" });
  res.json({ message: "Appointment created" });
});

const retrievePublicAppointments = asyncHandler(async (req, res) => {
  //get thei id from the requrl
  const { pathname } = req._parsedOriginalUrl;
  const id = pathname.replace("/shops/public/appointments/", "");
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

  shop.appointments.map((app) => {
    appList.push({
      date: app.date,
      startTime: app.startTime,
      endTime: app.endTime,
    });
  });
  res.json({ appList, allTimeSlots });
});

module.exports = {
  createAppointment,
  retrievePublicAppointments,
};
