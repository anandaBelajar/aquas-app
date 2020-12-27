const { urlencoded } = require('body-parser'),
    express = require('express'),
    mysql = require('mysql'),
    passport = require('passport'),
    flash = require('express-flash'),
    session = require('express-session'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    initializePassport = require(__dirname + '/passport-config.js')

var app = express(); //express function

app.set('view engine', 'ejs'); //set the view engine

//include the views file
app.set('views', [path.join(__dirname, './../views'),
    path.join(__dirname, './../views/single/'),
    path.join(__dirname, './../views/administrators/'),
]);

var port = process.env.SERVER_PORT, //server configuration
    server = app.listen(process.env.SERVER_PORT, function() {
        console.log('listening to request on port ' + port);
        console.log('url:http://localhost:' + port);
    }),
    con = mysql.createConnection({ //database configuration
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true
    }),
    main_controller = require('./../controllers/main-controller.js'), //include sensor controller js
    websocket = require(__dirname + '/websocket.js'); //include websocket js


initializePassport(passport, con)

//Static files
app.use(express.static('./../public'));
app.use('/chartjs', express.static(__dirname + './../node_modules/chart.js/dist/Chart.min.js')); //chartjs library
app.use('/public', express.static(__dirname + './../public'));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())

main_controller(app, con, path, passport); //call main_controller function from main-controller.js
websocket(server, con); //call websocket function from websocket.js