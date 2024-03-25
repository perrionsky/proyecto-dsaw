"use strict";

const express = require('express');
const router = require('./app/controllers/router');
const app = express()
const port = 3000;

app.use(express.json());
app.use('/', router);

app.listen(port, () => {
    console.log(`Practica 3 corriendo ${port} `);
});
