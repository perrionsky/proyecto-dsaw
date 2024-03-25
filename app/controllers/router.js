"use strict";

const express = require('express');
const router = express.Router();
const productRouter = require('./../routes/products');
const adminProductRouter = require('./../routes/admin_products');
const path = require('path');

router.use('/admin/products/', validateAdmin, adminProductRouter);
router.use('/products/', productRouter);

router.get(['/', '/home'], (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});


router.get('/shopping_cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'cart.html'));
});



function validateAdmin(req, res, next) {
    let adminToken = req.get("x-auth");
    if (!adminToken || adminToken !== "admin") {
        res.status(403).send("");
    }
    next();
}

module.exports = router;