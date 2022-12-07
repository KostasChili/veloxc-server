const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopsController');


router.route('/')
.get(shopController.getAllShops)
.post(shopController.createShop)
.patch(shopController.updateShop)
.delete(shopController.deleteShop)


module.exports = router;