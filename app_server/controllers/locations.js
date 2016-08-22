//request module: allow express to call API URLs, and interpret response
var request = require('request');
//default server url for local development
var apiOptions = {
    server : "http://localhost:3000"
};
//API call needs URL which differs based on environment, change node_env
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://getting-mean-loc8r.herokuapp.com";
}

//JUST the options
/*var requestOptions = {
    url : "http://yourapi.com/api/path",
    method : "GET",
    //body of request, only IF we are sending something to database, can even be empty object
    json : {},
    //query string parameters
    qs : {
        offset : 20
    }
};*/

//uses options made above as first argument
//calback runs when response comes back from API

/*request(requestOptions, function(err, response, body) {
    if (err) {
    console.log(err);
    } else if (response.statusCode === 200) {
    console.log(body);
    } else {
    console.log(response.statusCode);
    }
});*/


var renderHomepage = function(req, res, responseBody){
    var message;
    if (!(responseBody instanceof Array)) {
        message = "API lookup error";
        responseBody = [];
    } else {
        if (!responseBody.length) {
            message = "No places found nearby";
        }
    }
    res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        //message is added here to SEND TO VIEW TO RENDER
        message: message
    });
};

        //swapped bottom stuff out for "responseBody" above
        /*[{
            name: 'Starcups',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '100m'
        },{
            name: 'Cafe Hero',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 4,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '200m'
        },{
            name: 'Burger Queen',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 2,
            facilities: ['Food', 'Premium wifi'],
            distance: '250m'
        }]*/



/* GET home page*/

//CONTROLLERS

//the first argument is the VIEW which is JADE format 
//second argument is the Javascript object containing data to send to view
//res.render Renders a view and sends the 
//rendered HTML string to the client.

//we're rendering an ARRAY of single location objects
//array is called "locations", use for-each loop 
module.exports.homelist= function(req, res){
	var requestOptions, path;
    path = '/api/locations';
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {},
        qs : {
            lng : -0.9630884,
            lat : 51.451041,
            maxDistance : 20
        }
    };
    request(
        requestOptions,
        function(err, response, body) {
            var i, data;
            data = body;
            if (response.statusCode === 200 && data.length) {
                for (i=0; i<data.length; i++) {
                    data[i].distance = _formatDistance(data[i].distance);
                }
            }
            //render AFTER getting the info
            renderHomepage(req, res, data);
        }
    );
};

var _formatDistance = function (distance) {
    var numDistance, unit;
    if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
    } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
    }
    return numDistance + unit;
};



var renderDetailPage = function(req,res, locDetail){
    res.render('location-info', {
            title: locDetail.name,
            pageHeader: {title: locDetail.name},
            sidebar: {
                context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
                callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
            },
            location: locDetail
    })
};

/* GET Location info page*/
module.exports.locationInfo = function(req, res) {
    var requestOptions, path;
    path = "/api/locations/" + req.params.locationid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            var data = body;
            data.coords = {
                lng : body.coords[0],
                lat : body.coords[1]
            };
            renderDetailPage(req, res, data);
        }
    );
};

/* GET add review page*/
module.exports.addReview= function(req, res){
	res.render('location-review-form', {
        title: 'Review Starcups on Loc8r',
        pageHeader: { title: 'Review Starcups' }
    });
};