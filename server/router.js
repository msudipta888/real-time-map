const express = require('express');

const {getNearByPlaces} = require('./index.js');

const router = express.Router();


const getNearByPlacesRoute= router.post('/location',require('./middleware/auth.js') ,getNearByPlaces);
module.exports = {getNearByPlacesRoute};