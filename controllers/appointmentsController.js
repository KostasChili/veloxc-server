const User = require("../models/User");
const Shop = require("../models/Shop");
const Appointment = require('../models/Appointment');
const asyncHandler = require("express-async-handler");
const { findByIdAndDelete, findById } = require("../models/User");




//@desc Make appointment through public page
//@route POST /shop/public/id
//@access public

const makeAppointment = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const {name,lastName,service,date} = req.body;
    if(!id || !name || !lastName || !service || !date) return res.status(400).json({message:' All fields required'});
    const shop = await Shop.findById(id);
    if(!shop) return res.status(400).json({message:`no shop under id ${id}`});
    //TODO check if customers appointment allready exists
    const customerInfo = {
      shopId :id,
      customerName:name+" "+lastName,
      service,
      date,
      active:true
    }
    const appointment = await Appointment.create({...customerInfo});
   
    if(!appointment) res.status(400).json({message:'Invalid appointment data'});
    shop.appointments.push(appointment);
    const shopRes = await shop.save();
    const appRes  = await appointment.save();
    if(!shopRes || !appRes) return res.status(400).json({message:'Error creating appointment'});
    res.json({message:`Appointment for ${customerName} for ${service} at ${date} created succesffuly`});

})



//@desc Get all appointments
//@route GET /shops/id/appointments
//@access Private

const getAllAppointments = asyncHandler(async(req,res)=>{
    const result = await Appointment.find().lean().exec();
    if(!result){
        return res.status(400).json({message:'no appointments found'})
    }
    res.json(result);
});

//@desc Create new appointment
//@route post /shops/id/appointments
//@access Private



const createAppointment = asyncHandler(async(req,res)=>{
    const {id,customerName,service,date} = req.body;
   
    if(!id || !customerName || !service || !date)
    {
        return res.status(400).json({message:'all fields are required'})
    }
    const shop = await Shop.findById(id).exec();
    if(!shop){
        return res.status(400).json({message:`no shop under id ${id}`})
    }
    const appointment = new Appointment ({
        shopId:id,
        customerName,
        service,
        date,
    })
    shop.appointments.push(appointment);
    
    const appResult = await appointment.save();
    const shopResult = await shop.save();
    if(!appResult || !shopResult)
    {
        return res.status(400).json({message:'invalid data'});
    }
    res.json({message:`appointment created successfully`});
});

//@desc Update an appointment
//@route PATCH /shops/id/appointments
//@access Private

const updateAppointment = asyncHandler(async(req,res)=>{
    const {id,shopId,newCustomerName,newService,newDate,newActive} = req.body;
    if(!id || !shopId)
    {
        return res.status(400).json({message:'all fields required'});
    }
   const appointment = await Appointment.findById(id)
    if(!appointment)
    {
        return res.status(400).json({message:'all fields required'});
    }
    if(newCustomerName) appointment.customerName=newCustomerName;
    if(newService) appointment.service=newService;
    if(newDate) appointment.date=newDate;
    if(newActive) appointment.active = newActive;
    const shop = await Shop.findByIdAndUpdate(shopId,{$where:{appointments:id},appointment});
    if(!shop)
    {
        return res.status(400).json({message:"bad shop info"});
    }
    const result = await appointment.update();
    if(!result){
        return res.status(400).json({message:"bad appointment info"});
    }
    res.json({message:`updated appointment`})
});

//@desc Delete an appointment
//@route DELETE /shops/id/appointments
//@access Private

const deleteAppointment = asyncHandler(async(req,res)=>{
    const {id,shopId} = req.body;
    if(!id || !shopId)
    {
        return res.status(400).json({message:'id required'})
    }
    const shop = await Shop.findByIdAndUpdate(shopId,{$pull:{appointments:id}});
    if(!shop){
       return res.status(400).json({message:`no shop was found under id ${shopId}`})
    }
    const appointment  = await Appointment.findByIdAndDelete(id);
    if(!appointment)
    {
       return  res.status(400).json({message:`no appointment was found under id ${id}`})
    }
    res.json({message:`Appointment under name ${appointment.customerName} for ${appointment.service} was deleted successfully`});

});


module.exports = {
    getAllAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
}