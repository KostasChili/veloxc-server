const User = require ('../models/User');
const Shop = require('../models/Shop');
const Appointment = require ('../models/Appointment');
const asyncHandler = require('express-async-handler');






//@desc public route to create Appointments
//@route POST shops/public/appointmens
//@access public

const createAppointment = asyncHandler(async(req,res)=>{
    const {id,customerName,service,date} = req.body;
    console.log(id,customerName,service,date)
    if(!id || !customerName || !service || !date)
    {
        return res.status(400).json({message:'All fields required'});
    }
    const shop = await Shop.findById(id);
    if(!shop) return res.status(400).json({message:'No shop found'});
    const appointmentObj = {
        shopId:id,
        customerName,
        service,
        date,
        active:true
    }
    const appointment = await Appointment.create(appointmentObj);
    if(!appointment) return res.status(400).json({message:'invalid data'})
     await shop.appointments.push(appointment);
     const shopRes = shop.save();
    if(!shopRes) return res.status(400).json({message:'error saving in shop'});
    res.json({message:'Appointment created'})
});



module.exports={
    createAppointment    
}