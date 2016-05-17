/* GET home page*/
//export a function called index
module.exports.index = function(req, res){
	res.render('index', {title:'Express'});
};