/* GET home page*/
//export a function called about
module.exports.about = function(req, res){
	res.render('generic-text', {title:'About'});
};