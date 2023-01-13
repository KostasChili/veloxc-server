//this would havbe been avoided with proper routing design
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const appointmentsController = require('../controllers/appointmentsController');

router.route(verifyJWT,'/:appId')
.get(appointmentsController.retrieveOneAppointmentDetails)

router.route(verifyJWT,'/:appId/cancel')
.get(appointmentsController.cancelAppointmentStatus)


module.exports = router;