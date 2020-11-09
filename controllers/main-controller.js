var bodyParser = require('body-parser')

module.exports = function(app, con) { //exports the function

    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/', function(req, res) {
        //index route
        res.render('index'); //render the ejs view for index page
    });

    app.get('/gentelella', function(req, res) {
        //index route
        res.render('gentelella-index'); //render the ejs view for index page
    });

    app.get('/backup', function(req, res) {
        //index route
        res.render('index-backup'); //render the ejs view for index page
    });

    //Start Single Route
    app.get('/single-feed', function(req, res) {
        //light detail page route
        //con.query("SELECT * FROM `light` ORDER BY `date` DESC", function(err, result) {
        //select all light sensor value and time from the database
        // if (err) throw err;
        res.render('single-feed', {
            //render the ejs view for light detail page
            //items: result, //send the data from database to the light detail page
        });
        //});
    });

    app.get('/single-light', function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `data_cahaya` ORDER BY `waktu` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-light', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });

    app.get('/single-temp', function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `data_suhu` ORDER BY `waktu` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-temp', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });

    app.get('/single-ph', function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `data_ph` ORDER BY `waktu` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-ph', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });


    //End Single Route


}