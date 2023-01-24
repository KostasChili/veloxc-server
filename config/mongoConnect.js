const mongoose  = require('mongoose');
const onlinedb = process.env.DATABASE_URI_CLOUD
const offlinedb = process.env.DATABASE_URI_LOCAL
const dbURI = (process.env.NODE_ENV==='development')?onlinedb : offlinedb;
console.log(dbURI)

const connectDB = async ()=>{
   try{
    await  mongoose.connect(dbURI,{
        useUnifiedTopology:true,
        useNewUrlParser:true,
        
    });
   }
   catch(e){
    console.log(e);
   }
}
module.exports = connectDB;