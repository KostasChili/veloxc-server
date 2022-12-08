const User = require("../models/User");
const Shop = require("../models/Shop");
const asyncHandler = require("express-async-handler");
const { json } = require("express");
const { rawListeners } = require("../models/User");


//@desc Get all appointments
//@route GET /shops/id/appointments
//@access Private

//admin has access to all shops and can see all appointments for each shop
//shopkeeper has access to his shops and can see all appointments for each shop
//a user can see only his appointments for each shop
const getAllApointments = asyncHandler(async(req,res)=>{
    //front end request containing shop id
        const {id} = req.body;
        //on future we also recieve users id and check if he has access
        //verify data
        if(!id) return res.status(400).json({message:'Shop Id required'});
        //find the shop
        const shop = await Shop.findById(id).select('-description').exec();
        //verify
        if(!shop) return res.status(400).json({message:`Shop with id ${id} was not found`});
        //verify dates exists
        if(!shop?.appointments?.length) {
            return res.status(400).json({message:`No appointments on shop with id${id}`});
        }
        res.json(shop); //return the shop with all fields (no description) will have to check later


});

//@desc Create an appointment
//@route POST /shops/id/appointments
//@access Private

//an appointment can be created by a user or injected by a shopkeeper or an admin
const createAppointment = asyncHandler(async(req,res)=>{
    const{customerName,service,date,id} = req.body;
    //verify
     if(!customerName || !service || !date || !id)
     {
        return  res.status(400).json({message:'All fields required'});
     }
     //find shop
     const shop = await Shop.findById(id).exec();
     //verify shop exists
     if(!shop) return res.status(400).json({message:`No shop under id ${id}`});
     //would be a good idea to verify later on 
     //1. there is no other appointment at the same day and time
     //2. the customerName has not allready set the same appointment (in case something goes bad and they retry)
     //3. every appointment should be assigned a uniq id (uuid) which can be used later on 
     const appointment = {
        customerName,
        service,
        date
     };
     shop.appointments.push(appointment);
    const result = await shop.save();
    if(!result){
        return res.status(400).json({message:'invalid appointment info'});
    }
    res.json({message:`Appointment was created successfully at ${shop.title}`});


});

//@desc Update an appointment
//@route PATCH /shops/id/appointments
//@access Private


const updateAppointment = asyncHandler(async(req,res)=>{
    //we need a shop id a customer name and a date and service
    const{id,customerName,date,service,newCustomerName,newDate,newService,active}= req.body; 
    //verify
    if( !id || !customerName || !date || !service || !newCustomerName || !newDate || !newService )
    {
        return res.status(400).json({message:'All fields are required'});
    }
    //find the shop
    const shop = await Shop.findById(id).select('-description').exec();
    //verify shop
    if(!shop)
    {
        return res.status(400).json({message:`No shop under id ${id} was found`})
    }
    //verify appointments exists on this shop
    if(!shop.appointments){
        return res.status(400).json({message:`No appointments on ${shop.title} shop`});
    }
    //if appointments exists find the appointments with the customers name
    const customerAppointment = shop.appointments.filter(appointment=>{
         if(appointment.customerName===customerName && appointment.service===service && appointment.date === date)
         {
             return appointment
         }
    });
    //verify the appointment exists
    if(!customerAppointment.length){
        return res.status(400).json({message:`Appointment under name ${customerName}, for ${service} with date of ${date} does not exists on shop ${shop.title}`})
    }
    //update the appointment
    customerAppointment.customerName = newCustomerName;
    customerAppointment.service = newService;
    customerAppointment.date = newDate;
    customerAppointment.active = active;
    const appId = customerAppointment._id;
    console.log(customerAppointment);
    console.log(appId);
    res.json({message:'ok'})

});

//@desc Delete an appointment
//@route DELETE /shops/id/appointments
//@access Private


const deleteAppointment = asyncHandler(async(req,res)=>{

});

module.exports = {
    getAllApointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
    }