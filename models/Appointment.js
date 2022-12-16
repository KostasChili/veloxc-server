const mongoose = require ('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
    time:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    },
   
},
{
    timestamps:true
}

);

appointmentSchema.plugin(AutoIncrement,{
    inc_field:'ticket',
    id:'ticketNums',
    start_seq:100
})


module.exports = mongoose.model("Appointment",appointmentSchema);