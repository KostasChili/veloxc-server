const express = require ('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const verifyJWT = require('../middleware/verifyJWT');



router.route('/')
.post(appointmentsController.createAppointment)


module.exports = router;