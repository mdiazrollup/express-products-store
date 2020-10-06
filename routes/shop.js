const express = require('express');
const path = require('path');
const shopController = require('../controllers/shop');


const router = express.Router();

//Add a new middleware function
// next is pass by express to allow to travel to next middleware
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

module.exports = router;