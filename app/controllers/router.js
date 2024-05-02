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

router.post('/users/login', async (req, res) => {
    const userId = req.body.username;
    const password = req.body.password; // Ensure password is securely handled and stored
    let resDB = await firebaseHelper.setUserLoginData(userId, password);

    console.log(resDB);
    if (resDB) {
        // validate password
        let isValidPassword = await firebaseHelper.validatePassword(userId, password);
        if (!isValidPassword) {
            // redirect to index()
            return res.status(400).send('{"state" : "error", "message" : "Password incorrect" ');
            return res.redirect('/'); // ADRIAN esta es una opcion, si es que quieres cargar desde el front
        }
    }
    
    // this model is defined under controllers/models, and is the 
    // base for the API responses 

    const userTOKEN = userHelpers.generateUUID(); // random access token for temp sess
    resDB = firebaseHelper.setUserToken(userId, userTOKEN);
    // push that token into the database
    res.status(200).send('{"state" : "success", "message" : "' + userTOKEN + '" }');
});




// Nos sirve para validar en cada peticion si el usuario esta logueado o no!
router.post('/users/is-logged-in', async (req, res) => {
    const userId = req.body.username;
    const userTOKEN = req.body.userTOKEN; // Ensure password is securely handled and stored
    let resDB = await firebaseHelper.validateToken(userId, userTOKEN);

    if (!resDB) {
        // is not logged in, notify user
        return res.status(400).send('{"state" : "error", "message" : "Token does not matches" ');
    }

    return res.status(200).send('{"state" : "success", "message" : "Token matches" ');
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



// routes for post detail

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



// CRUD POSTS

router.get('/users/:username/:post_id', async (req, res) => {
    const username = req.params.username;
    const post_id = req.params.post_id;

    // now check if the post exists
    let post_info = await firebaseHelper.getPostById(username, post_id);
    if (post_info === undefined) {
        // post does not exist
        // we can send them to a 404 page
        // ADRIAN, aqui si retorna 404, mandalo a un not found
        return res.status(404).send('{"state" : "error", "message" : "Post not found" ');
    }

    let postDetailOnString = JSON.stringify(post_info);
    return res.status(200).send(`{"state" : "success", "message" : "${postDetailOnString}"`);

    // ADRIAN, aqui se va a retornar toda la info del post, por lo tanto es importante que
    // cuando el usuario habra el post detail siempre se verifique que
    // si el es el owner del post, entonces pueda modificar la info en el html, de lo contrario
    // le aparecera en readonly, eso lo haces con el userTOKEN

    // para validar si es el owner, simplemente manda a llamar al endpoint de /is-logged-in/ 
    // donde le pasas por parametro el username del post que se acaba de abrir, mas el userTOKEN
    // que tienes guardado en el session storage y si sale bien, es por que es su post y puede editarlo!

});



// TODO PENDING ANDRES!

router.post('/users/:username/post/', async (req, res) => {
    const username = req.params.username;
    const post_id = req.params.post_id;

    const token = req.headers['authorization']; // Commonly tokens are passed in the 'Authorization' header

    // Check if the token is present
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    // now check if the post exists
    let post_info = await firebaseHelper.getPostById(username, post_id);
    if (post_info === undefined) {
        // post does not exist
        // we can send them to a 404 page
        // ADRIAN, aqui si retorna 404, mandalo a un not found
        return res.status(404).send('{"state" : "error", "message" : "Post not found" ');
    }

    let postDetailOnString = JSON.stringify(post_info);
    return res.status(200).send(`{"state" : "success", "message" : "${postDetailOnString}"`);

    // ADRIAN, aqui se va a retornar toda la info del post, por lo tanto es importante que
    // cuando el usuario habra el post detail siempre se verifique que
    // si el es el owner del post, entonces pueda modificar la info en el html, de lo contrario
    // le aparecera en readonly, eso lo haces con el userTOKEN

    // para validar si es el owner, simplemente manda a llamar al endpoint de /is-logged-in/ 
    // donde le pasas por parametro el username del post que se acaba de abrir, mas el userTOKEN
    // que tienes guardado en el session storage y si sale bien, es por que es su post y puede editarlo!

});

// TODO PENDING! ANDRES

router.put('/users/username:/post_id:/', async (req, res) => {
    const username = req.params.username;
    const post_id = req.params.post_id;

    const token = req.headers['authorization']; // Commonly tokens are passed in the 'Authorization' header

    // Check if the token is present
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    // now check if the post exists
    let post_info = await firebaseHelper.getPostById(username, post_id);
    if (post_info === undefined) {
        // post does not exist
        // we can send them to a 404 page
        // ADRIAN, aqui si retorna 404, mandalo a un not found
        return res.status(404).send('{"state" : "error", "message" : "Post not found" ');
    }

    let postDetailOnString = JSON.stringify(post_info);
    return res.status(200).send(`{"state" : "success", "message" : "${postDetailOnString}"`);

    // ADRIAN, aqui se va a retornar toda la info del post, por lo tanto es importante que
    // cuando el usuario habra el post detail siempre se verifique que
    // si el es el owner del post, entonces pueda modificar la info en el html, de lo contrario
    // le aparecera en readonly, eso lo haces con el userTOKEN

    // para validar si es el owner, simplemente manda a llamar al endpoint de /is-logged-in/ 
    // donde le pasas por parametro el username del post que se acaba de abrir, mas el userTOKEN
    // que tienes guardado en el session storage y si sale bien, es por que es su post y puede editarlo!

});


router.delete('/users/username:/post_id:/', async (req, res) => {
    const username = req.params.username;
    const post_id = req.params.post_id;

    const token = req.headers['authorization']; // Commonly tokens are passed in the 'Authorization' header

    // Check if the token is present
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    // now check if the post exists
    let resDB = await firebaseHelper.deletePostById(username, post_id, token);
    if (resDB === false) {
        // cannot delete post, probably beacuse of ownership
        return res.status(400).send('{"state" : "error", "message" : "Could not delete post" ');
    }

    return res.status(200).send(`{"state" : "success", "message" : "Post deleted"`);

    // ADRIAN, aqui se regresa al /my-posts/ del usuario logueado

});


function validateAdmin(req, res, next) {
    let adminToken = req.get("x-auth");
    if (!adminToken || adminToken !== "admin") {
        res.status(403).send("");
    }
    next();
}



module.exports = router;