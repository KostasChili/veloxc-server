const mongoose = require ('mongoose');

const shopSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tel:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required :true
    },
    address:{
        type:String,
        required :true
    },
    appointments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Appointment'
        }
    ],
    publicLink:{
        type:String
    }
   
});

module.exports = mongoose.model("Shop",shopSchema);