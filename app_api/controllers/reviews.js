//give access to database connection
var mongoose = require('mongoose');
//brings in the Location model so that we can interact with the Locations collection
var Loc = mongoose.model('Location');

var sendJSONResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.reviewsCreate = function (req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
    .findById(locationid)
    .select('reviews')
    .exec(
      function(err, location) {
       if (err) {
        sendJsonResponse(res, 400, err);
        } else {
         doAddReview(req, res, location);
        }
      }
    );
  } 
  else {
    sendJSONResponse(res, 404, {"message": "Not found, locationid required"});
    }
};



module.exports.reviewsReadOne = function (req, res) {
  if(req.params && req.params.locationid && req.params.reviewid){
    Loc.findById(req.params.locationid).select('name reviews').exec(function(err,location) { 
                                       //select is mongoose 
                                       //method for getting
                                       //ONLY a name and reviews
                                       //of a location       
        var response, review;
        if(!location){ 
          sendJSONResponse(res, 404, {"message":"locationid not found"});
          return;
        } else if(err){
          sendJSONResponse(res, 404, err);
          return;
        }
        
        //check if returned location HAS reviews
        if(location.reviews && location.reviews.length > 0){
          //method .id RETURNS the single matching SUBdocument
          review = location.reviews.id(req.params.reviewid);
          
            if(!review){
            	sendJSONResponse(res, 404, {"message":"reviewid not found"});
            } 
            else{
            	response = {location : { name : location.name,
          		                         id : req.params.locationid},
          	              review : review};
          	  sendJSONResponse(res, 200, response);
            }
        }
        else {
        	sendJSONResponse(res, 404, {"message" : "No reviews found"});
        }	
    }); 

  }else { 
    sendJSONResponse(res, 404, {"message":"Not found, locationid and reviewid both required"});
  }
};
 

module.exports.reviewsUpdateOne = function (req, res) {
  sendJSONResponse(res, 200, {"status" : "success"});
};

module.exports.reviewsDeleteOne = function (req, res) {
  sendJSONResponse(res, 200, {"status" : "success"});
};

