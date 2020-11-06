var express = require('express'); //express package
var mysql = require('mysql'); //mysql package


var app = express(); //express function

app.set('view engine', 'ejs'); //view engine
app.set('views', __dirname + './../views');

var port = 3000 //server port

var server = app.listen(port, function() {
    //setup a server in port 3000
    console.log('listening to request on port ' + port);
    console.log('url:http://localhost:' + port);
});

var con = mysql.createConnection({
    //database config
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

var sensor_controller = require('./../controllers/sensor-controller.js'); //sensor controller
var websocket = require(__dirname + './../websocket.js'); //websocket

console.log(__dirname)

//Static files
app.use(express.static('./../public'));
app.use('/chartjs', express.static(__dirname + './../node_modules/chart.js/dist/Chart.min.js')); //chartjs library
app.use('/public', express.static(__dirname + './../public'));
//app.use('/styles', express.static(__dirname + '/public/css')); //stylesheet
//app.use('/scripts', express.static(__dirname + '/public/js')); //script 

sensor_controller(app, con); //call sensorController
websocket(server, con); //call websocket