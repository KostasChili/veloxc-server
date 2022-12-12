const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    roles:[{
        type:String,
        default:'1000'
    }],
    email:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('User',userSchema);