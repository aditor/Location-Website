var mongoose = require('mongoose');

//our MODEL of a location (Loc)
var Loc = mongoose.model('Location');

var theEarth = (function(){
  var earthRadius = 6371; // km, miles is 3959
  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };
  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  //exposing these functions: because they are PRIVATE, need to bring
  //them out of that scope, so returning it works
  return {
   getDistanceFromRads : getDistanceFromRads,
   getRadsFromDistance : getRadsFromDistance
  };
})();


var sendJSONResponse = function(res, status, content) {
  res.status(status); //send response status code (ex. 200)
  res.json(content); //send response data
};

//mongoose method geoNear: finds list of locations CLOSE TO A POINT
//    up to a maximum distance
//geonear takes 3 points: geoJSON point, options object, callback
// no exec method: executes immediately
//URL parameters DOES NOT HAVE coordinates, so need query string:
//    req URL looks like: api/locations?lng=-0.7992599&lat=51.378091
//Express puts query STRING values into a QUERY object ATTACHED to
//    a REQUEST object: req.query.lng
//parsefloat turns the STRING into a number

module.exports.locationsListByDistance = function (req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var point = {
               type: "Point",
               coordinates: [lng, lat]
              };
  var geoOptions = {
    spherical: true,
    //max distance limit 
    maxDistance: theEarth.getRadsFromDistance(20),
    //10 things within max distance
    num: 10
  };
  //lat or lng are not in right format
  if(!lng || !lat){
    sendJSONResponse(res, 404, {
      "message":"lng and lat query parameters are required"
    });
    return;
  }
  //CALLBACK FUNCTION: 3 parameters
//API response should only have SOME data (Specifically the location stuff)
//we need to filter out this shit
//loop through results, push RELEVANT data into new array, return this shit
  Loc.geoNear(point, geoOptions, function (err, results, stats) {
  var locations = [];
  //if query returns error:
  if(err){
    sendJSONResponse(res, 404, err);
  } else{
  //LOOPING THROUGH:
      results.forEach(function(doc) {
       locations.push({
         distance: theEarth.getDistanceFromRads(doc.dis),
         name: doc.obj.name,
         address: doc.obj.address,
         rating: doc.obj.rating,
         facilities: doc.obj.facilities,
         _id: doc.obj._id
       });
      });
      //send processed data back as JSON response
     sendJSONResponse(res, 200, locations);
    }
  });
};



module.exports.locationsCreate = function (req, res) {
  //.create function (datatosave, callback):
  //first parameter: javascript OBJECT to put into database
  //second: callback function
  console.log(req.body);
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function(err, location) {
    if (err) {
      console.log(err);
      sendJSONResponse(res, 400, err);
    } else {
      console.log(location);
      sendJSONResponse(res, 201, location);
    }
  });
};


module.exports.locationsReadOne = function (req, res) {
 
  // We are trying to get the locationid FROM the URL 
  // app.get('/api/locations/:locationid', ctrlLocations.locationsReadOne)
  // access locationid from inside controller: 
  // "request" object has the "params" object, so,
  // req.params.locationid

 //error check 1:check if params object exists, AND locationid exists in params object
  if(req.params && req.params.locationid){
    //(findById) get location id from URL parameters, pass it to findById method
    Loc.findById(req.params.locationid)
       .exec(function(err,location) { // (exec) define callback to accept possible parameters
        if(!location){ //if mongoose doesn't return location, exit function, error message
          sendJSONResponse(res, 404, {"message":"locationid not found"});
          return;
        } else if(err){//if mongoose returned error, exit function
          sendJSONResponse(res, 404, err);
          return;
        }
        sendJSONResponse(res,200,location); //send document found as a JSON response
       });	
  } 

  else { //no locationid
    sendJSONResponse(res, 404, {"message":"No locationid in request"});
  }
};

module.exports.locationsUpdateOne = function (req, res) {
  if (!req.params.locationid) {
    sendJsonResponse(res, 404, {"message": "Not found, locationid is required"});
    return;
  }
  Loc
    .findById(req.params.locationid)
    //dash means retrieve everything except this
    //select normally means which columns we DO want to retrieve
    .select('-reviews -rating')
    .exec(
      function(err, location) {
       if (!location) {
          sendJsonResponse(res, 404, {"message": "locationid not found"});
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        //UPDATE the paths with values from SUBMITTED FORM
        //When your query finds the document you
        //get a model instance. If you make changes to this instance and then save it, Mongoose
        //will update the original document in the database with your changes
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng),
                           parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
          }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        //SAVE INSTANCE
        location.save(function(err, location) {
          if (err) {
          sendJsonResponse(res, 404, err);
          } else {
          sendJsonResponse(res, 200, location);
          }
        });
      }
    );
};


module.exports.locationsDeleteOne = function (req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
   Loc
   //findbyidandremove is the mongoose delete function
    .findByIdAndRemove(locationid)
    .exec(
      function(err, location) {
        if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 204, null);
      }
    );
  } 
  else {
    sendJsonResponse(res, 404, {"message": "No locationid"});
  }
};


