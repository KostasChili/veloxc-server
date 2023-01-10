const mongoose = require ('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const appointmentSchema = new mongoose.Schema({
    shopId:{
        type:String,
        ref:'Shop'
    },
    customerName:{
        type:String,
        required:true
    },
    service:{
        type:String,
        required:true
    },
    comments:{
        type:String
    },
    date:{
        type:String,
        required:true
    },
    startTime:{
        type:String,
        required:true
    },
    endTime:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    //used to validate via mail
    active:{
        type:Boolean,
        default:false
    },
    //used to check if the app date is past due
    completed:{
        type:Boolean,
        default:false
    },
    //used for the shop keeper to keep note if the customer did not attend
    attended:{
        type:Boolean,
        default:true
    },
    cancelled:{
        type:Boolean,
        default:false
    }
   
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