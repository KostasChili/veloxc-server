const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const shopController = require('../controllers/shopsController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/public/:id')
.get(shopController.getPublicShopPage)

router.route('/:id/appointments')
.get(verifyJWT,shopController.retrieveAppointments)



router.route('/')
.get(verifyJWT,shopController.getMyShops)
.post(verifyJWT,shopController.createShop)
.patch(verifyJWT,shopController.updateShop)
.delete(verifyJWT,shopController.deleteShop)


module.exports = router;