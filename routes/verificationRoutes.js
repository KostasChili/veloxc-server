const express = require('express');
const router = express.Router();
const verificationsController = require('../controllers/verificationsController')


router.route('/:id')
.get(verificationsController.verifyAppointment)

module.exports = router;