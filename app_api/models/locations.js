var mongoose = require( 'mongoose' );


var openingTimeSchema = new mongoose.Schema({
	days: {type: String, required: true},
	opening: String,
	closing: String,
	closed: {type: Boolean, required: true}
});

var reviewSchema = new mongoose.Schema({
author: String,
rating: {type: Number, required: true, min: 0, max: 5},
reviewText: String,
createdOn: {type: Date, "default": Date.now}
});

//object {} is where we define schema
var locationSchema = new mongoose.Schema({
//validation for name: it HAS to be there for every location (required)
//saving location w/o name would return validation error
name: {type: String, required: true},
address: String,
//no reviews when new location added to database, so default= 0
//validation here too: min and max
rating: {type: Number, "default": 0, min: 0, max: 5},
//array of string below
facilities: [String],
//2dsphere: geometry based on spherical oject
coords: {type: [Number], index: '2dsphere'},
//nested subdocuments: an arrray of these apply to ONE location, ex. mon-fri, sat, sun
openingTimes: [openingTimeSchema],
//reviews for one location
reviews: [reviewSchema]
});

//compile model from schema
//parameter: (name of model, schema to use)
mongoose.model('Location', locationSchema);

