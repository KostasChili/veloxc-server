const Appointment = require('../models/Appointment');
const asyncHandler = require('express-async-handler');
const transporter = require('../config/transporter');
const nodemailer = require('nodemailer');


const verifyAppointment = asyncHandler(async(req,res)=>{
    console.log('here i am veri')
    const {id}= req.params;
    if(!id) return res.status(400).json({message:'appointment id required'});
    const result = await Appointment.findOne({_id:id}).populate('shopId').exec();
    if(!result) return res.status(400).json({message:`no appointment under id ${id} was found` });
    if(result.active) return res.status(309).json({message:'appointment allready confirmed, no change'})
    result.active = true;
    const finalRes = await result.save();
    if(!finalRes) return res.status(500).json({message:'There was an error confirming your appointment'});
    //the appointment uniqe code is using the app id. This should change in the future with a uuid so it wont expose the database id
    let mailTemplate = `Το ραντεβού σας για την επιχήρηση ${result.shopId.title} στης ${result.date} και ώρα ${result.startTime}-${result.endTime} για
    ${result.service} με σχόλια ${result.comments} και μοναδικό κωδικό ${result._id} έχει επιβεβαιωθεί.
    Με εκτίμηση 
    Η ομάδα του Velox Constitutio
    @veloxC`
    let info = await transporter.sendMail({
        from: '"VeloxC - Appointment-Confirm-Service" <appconfirm@veloxc.com>', // sender address
        to: result.email, // list of receivers
        subject: "Επιτυχής Επιβεβαίωση Ραντεβού", // Subject line
        text: mailTemplate, // plain text body
        //  html: emailHtml, // html body
      });

    res.json({message:'your appointments was successfully confirmed'})
})

module.exports = {
    verifyAppointment
}