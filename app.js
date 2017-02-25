var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var busboy = require('connect-busboy');
var rootCas = require('ssl-root-cas/latest').create();
 
// fixes ALL https requests (whether using https directly or the request module) 
require('https').globalAgent.options.ca = rootCas;
 
var secureContext = require('tls').createSecureContext({
  ca: rootCas
});


var app = express();

var db;

db = mongoose.connect('mongodb://localhost:27018/db_upload');

var port = process.env.PORT || 3000;

// diretorios publicos
app.use(express.static('public'));

//middlaware

//app.use(bodyParser.urlencoded({extended:true}));
//app.use(bodyParser.json());
//app.use(bodyParser({uploadDir:'./uploads'}));
app.use(busboy()); 
app.set('views','./src/views');


//rotas

var uploadRouter = require('./src/routes/UploadRoutes');

app.use('/api/v1/upload', uploadRouter);


app.get('/', function(req, res){
	//res.render('index');
	res.send('de buenas upload');
	console.log('de buenas upload');
});

// start servidor
app.listen(port, function(err){
	console.log('running upload on '+port);
});


module.exports = app;

