const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopsController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/public/:id')
.get(shopController.getPublicShopPage)
.post(shopController.makeAppointment);


router.route('/')
.get(verifyJWT,shopController.getMyShops)
.post(verifyJWT,shopController.createShop)
.patch(verifyJWT,shopController.updateShop)
.delete(verifyJWT,shopController.deleteShop)


module.exports = router;