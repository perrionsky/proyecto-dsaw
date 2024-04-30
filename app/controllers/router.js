"use strict";

const express = require('express');
const router = express.Router();
const productRouter = require('./../routes/products');
const adminProductRouter = require('./../routes/admin_products');
const firebaseHelper = require('./helpers/firebase_helper');
const userHelpers = require('./helpers/user_helpers');
const path = require('path');

router.use('/admin/products/', validateAdmin, adminProductRouter);
router.use('/products/', productRouter);

router.get(['/', '/home'], (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});


router.get('/shopping_cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'cart.html'));
});


router.get('/users/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

router.post('/users/login', (req, res) => {
    const userId = req.body.username;
    const password = req.body.password; // Ensure password is securely handled and stored
    let resDB = firebaseHelper.setUserLoginData(userId, password);

    console.log(resDB);
    
    // this model is defined under controllers/models, and is the 
    // base for the API responses 

    const userTOKEN = userHelpers.generateUUID(); // random access token for temp sess
    resDB = firebaseHelper.setUserToken(userId, userTOKEN);
    // push that token into the database
    res.status(200).send('{"state" : "success", "message" : "' + userTOKEN + '" }');
});





// routes for database update

router.get('/write_database', (req, res) => {
    firebaseHelper.writeFirebase();
    res.status(200).send("Todo excelente");
});


// routes for user
// IMPORTANT: every route requires the 'userTOKEN' field to validate data
// that field should be stores in localStorage or sessionStorage inside the browser
// and when doing requests, use that field inside the api requests and done!


router.get('/my-posts/:username', (req, res) => {
    const username = req.params.username;
    const token = req.headers['authorization']; // Commonly tokens are passed in the 'Authorization' header

    // Check if the token is present
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    // Proceed with your Firebase function if token validation passes
    firebaseHelper.getUserPosts(username, token)
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            console.error("Error fetching user posts", error);
            res.status(500).send("Error processing your request");
        });
});




function validateAdmin(req, res, next) {
    let adminToken = req.get("x-auth");
    if (!adminToken || adminToken !== "admin") {
        res.status(403).send("");
    }
    next();
}



module.exports = router;