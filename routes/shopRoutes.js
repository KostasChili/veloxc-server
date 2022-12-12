const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopsController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.route('/')
.get(shopController.getAllShops)
.post(shopController.createShop)
.patch(shopController.updateShop)
.delete(shopController.deleteShop)


module.exports = router;