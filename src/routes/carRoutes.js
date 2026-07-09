const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController'); // adjustment to match file layout

router.get('/cars', carController.getCar);
router.get('/cars/count/:userId', carController.getCarCount); // Required if checking count beforehand
router.post('/cars', carController.addCar);
router.delete('/cars/deletecar/:id', carController.deleteCar);

module.exports = router;