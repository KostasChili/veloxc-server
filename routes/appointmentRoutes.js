const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');


router.route('/')
.get(appointmentsController.getAllApointments)
.post(appointmentsController.createAppointment)
.patch(appointmentsController.updateAppointment)
.delete(appointmentsController.deleteAppointment)


module.exports = router;