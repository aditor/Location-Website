/* GET home page*/
module.exports.homelist= function(req, res){
	res.render('locations-list', {title:'Home'});
};
/* GET Location info page*/
module.exports.locationInfo = function(req, res){
	res.render('location-info', {title:'Location Info'});
};
/* GET add review page*/
module.exports.addReview= function(req, res){
	res.render('location-review-form', {title:'Add Review'});
};
//the first argument is the VIEW which is JADE format 
//res.render Renders a view and sends the 
//rendered HTML string to the client.