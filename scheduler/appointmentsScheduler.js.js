const Appointment = require("../models/Appointment");
const {logEvents} = require('../middleware/logger');

const {
  getDate,
  getMinutes,
  getHours,
  getYear,
  getMonth,
  addMonths,
} = require("date-fns");

const completeAppointments = async () => {
  var date = new Date();
  var year = getYear(date);
  var month = getMonth(date) + 1;
  var day = getDate(date);
  var hour = getHours(date);
  var minutes = getMinutes(date);
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  if (hour < 10) hour = "0" + hour;
  if (minutes < 10) minutes = "0" + minutes;

  const nowFormDate = new Date(`${year}-${month}-${day}T${hour}:${minutes}`);
  const res = await Appointment.find({completed:false})

    .select("-shopId -customerName -service -comments -email ")
    .exec();
    let cancelCounter=0;
    if(!res.length)
    {
      console.log('no apps')
    }
    else
    {
        
    await Promise.all(res.map(async (app) => { // <-- wait for all to solve.
      var appFormEndDate = new Date(`${app.date}T${app.endTime}`);
      if(nowFormDate>appFormEndDate)
      {
          app.completed = true;
          await app.save(); // <-- save only 1 document!
          cancelCounter++;
      }
    }));
    logEvents(`a total of\t${cancelCounter}\t appointments where updated to completed\n`,'appointmentsCron.log');
    
    }
    cancelCounter=0;
};

module.exports = {
  completeAppointments,
};
