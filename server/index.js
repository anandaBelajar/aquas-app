var express = require('express'); //express package
var mysql = require('mysql'); //mysql package
const path = require('path');

var app = express(); //express function

app.set('view engine', 'ejs'); //view engine
//app.set('views', __dirname + './../views');

app.set('views', [path.join(__dirname, './../views'),
    path.join(__dirname, './../views/single/'),
    path.join(__dirname, './../views/administrators/'),
]);

var port = process.env.SERVER_PORT //server port

var server = app.listen(process.env.SERVER_PORT, function() {
    //setup a server in port 3000
    console.log('listening to request on port ' + port);
    console.log('url:http://localhost:' + port);
});

var con = mysql.createConnection({
    //database config
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
});

var main_controller = require('./../controllers/main-controller.js'); //sensor controller
var websocket = require(__dirname + '/websocket.js'); //websocket

//Static files
app.use(express.static('./../public'));
app.use('/chartjs', express.static(__dirname + './../node_modules/chart.js/dist/Chart.min.js')); //chartjs library
app.use('/public', express.static(__dirname + './../public'));

main_controller(app, con); //call sensorController
websocket(server, con); //call websocket