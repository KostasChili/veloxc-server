require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;
const {reqlogger,logEvents} = require ('./middleware/logger');
const errorHandler = require ('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/mongoConnect');
const mongoose = require('mongoose');
const cron = require ('node-cron');
const {retrieveAllAppointmentsCron} = require('./scheduler/deactivateAppointments')

const db = mongoose.connection;

console.log(process.env.NODE_ENV);

app.use(reqlogger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

connectDB();

app.use('/',express.static(path.join(__dirname,'public'))); //where express will find statick files

app.use('/',require('./routes/root'));

app.use('/auth',require('./routes/authRoutes'));
app.use('/users',require('./routes/userRoutes'));
app.use('/shops',require('./routes/shopRoutes'));
app.use('/shops/public/appointments/:id/',require('./routes/appointmentsRoutes'))

app.all('*',(req,res)=>{
    res.status(404)
    if(req.accepts('html'))
    {
        res.sendFile(path.join(__dirname,'public','views','404.html'))
    }
    else if(req.accepts('json')){
        res.json({'message':'404 not found'});
    }
    else
    {
        res.type('txt').send('404 not found')
    }
});

app.use(errorHandler);

db.once('open',()=>{
    console.log('connected to db');
    app.listen(PORT,()=>{
        console.log(`Server running at port ${PORT}`);
    });
});

db.on('error',err=>{
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}\n`,'mongoErrLog.log');
});


cron.schedule('59 * * * * *',()=>{
   retrieveAllAppointmentsCron ();
console.log('cron run');
})
