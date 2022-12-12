const mongoose = require ('mongoose');

const appointmentSchema = new mongoose.Schema({
    shopId:{
        type:String,
        ref:'User'
    },
    customerName:{
        type:String,
        required:true
    },
    service:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    }
});


module.exports = mongoose.model("Appointment",appointmentSchema);