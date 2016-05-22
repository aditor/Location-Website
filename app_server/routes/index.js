var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');
// Variables for 2 controllers, each with collections

/*Locations pages*/
//EACH route needs reference to specific controller
//MAP URLS TO SPECIFIC CONTROLLERS (specific functionality, like homelist, etc.)
//router.get function (request, response) - req. = URL, res = function
//each function is a RES.RENDER function which renders the VIEW. OMG I get ITT
router.get('/', ctrlLocations.homelist); //HOMEPAGE
router.get('/location', ctrlLocations.locationInfo);
router.get('/location/review/new', ctrlLocations.addReview);

/*Other pages*/
router.get('/about', ctrlOthers.about);

module.exports = router;

