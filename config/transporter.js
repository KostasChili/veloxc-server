const nodemailer = require('nodemailer');


  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ETHEREAL_USERNAME, // generated ethereal user
      pass: process.env.ETHEREAL_PASSWORD, // generated ethereal password
    },
  });


  module.exports = transporter;