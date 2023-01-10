const express = require ('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const verifyJWT = require('../middleware/verifyJWT');

//public route to retrieve appointments for specific dates
//full route: /shops/public/appointments/:id/:dates
router.route('/:date')
.get(appointmentsController.retrievePublicAppointments)

//public route to create appointment
//full route: /shops/public/appointments/:id/
router.route('/')
.get(verifyJWT,appointmentsController.changeAppointmentAttendedStatus)
.post(appointmentsController.createAppointment)






module.exports = router;