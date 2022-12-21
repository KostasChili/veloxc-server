const User = require ('../models/User');
const Shop = require('../models/Shop');
const Appointment = require ('../models/Appointment');
const asyncHandler = require('express-async-handler');






//@desc public route to create Appointments
//@route POST shops/public/appointmens
//@access public

const createAppointment = asyncHandler(async(req,res)=>{
    const {id,customerName,service,date,time,email} = req.body;
    if(!id || !customerName || !service || !date || !time || !email)
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
        time,
        email,
        active:true
    }
    const appointment = await Appointment.create(appointmentObj);
    if(!appointment) return res.status(400).json({message:'invalid data'})
     await shop.appointments.push(appointment);
     const shopRes = shop.save();
    if(!shopRes) return res.status(400).json({message:'error saving in shop'});
    res.json({message:'Appointment created'})
});

const retrievePublicAppointments = asyncHandler(async (req,res)=>{
    //get thei id from the requrl
    const {pathname} =req._parsedOriginalUrl;
    const id = pathname.replace('/shops/public/appointments/',"")
    if(!id) return res.status(400).json({message:'shop id required'});
    const shop = await Shop.findById(id).populate('appointments');
    if(!shop) return res.status(400).json({message:'no shop was found'});
    if(!shop.appointments) return res.status(204).json({message:'no appointments where found'})
    const appList = [];
    shop.appointments.map((app)=>{
        appList.push({
            date:app.date,
            time:app.time
        })
    });
    res.json(appList);

});



module.exports={
    createAppointment,
    retrievePublicAppointments    
}