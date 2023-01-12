const rateLimit = require('express-rate-limit');
const {logEvent} = require ('./logger');

const loginLimiter = rateLimit({
    windwsMs: 60*1000, //1 minute
    max:5, //limit to fice login requests per window per minit from each IP
    message:{
        message:'Too many login attempts from this IP, please try again after 60 seconds'
    },
    handler: (req,res,next,options)=>{
        logEvents (`Too many Requests: ${option.message.message}\t${req.method}\t${req.url}\t${res.headers.origin}`,'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders:true,
    legactHeaders:false
});

module.exports = loginLimiter;