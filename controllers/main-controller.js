var bodyParser = require('body-parser')
var async = require('async')

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

    //Start Single Route
    app.get('/single-feed', function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `jadwal_pakan`", function(err, result) {
            //select all light sensor value and time from the database
            // if (err) throw err;
            res.render('single-feed', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });

    app.post('/single-feed', function(req, res) {
        console.log('request was made : ' + req.url);
        var check_table_query = "SELECT * FROM `jadwal_pakan`",
            query = "UPDATE `jadwal_pakan` SET `waktu` = '" + req.body.waktu_pakan_pagi.replace(/\s/g, '') + "' WHERE `jadwal_pakan`.`jenis` = 'pagi';";
        query += " UPDATE `jadwal_pakan` SET `waktu` = '" + req.body.waktu_pakan_siang.replace(/\s/g, '') + "' WHERE `jadwal_pakan`.`jenis` = 'siang';";
        query += " UPDATE `jadwal_pakan` SET `waktu` = '" + req.body.waktu_pakan_sore.replace(/\s/g, '') + "' WHERE `jadwal_pakan`.`jenis` = 'sore';";

        con.query(check_table_query, function(err, result) {
            if (err) throw err;
            console.log(result.length);
            if (result.length < 1) {
                query = 'INSERT INTO jadwal_pakan(jenis, waktu) VALUES ';
                query += "('pagi','" + req.body.waktu_pakan_pagi.replace(/\s/g, '') + "'),"
                query += "('siang','" + req.body.waktu_pakan_siang.replace(/\s/g, '') + "'),"
                query += "('sore','" + req.body.waktu_pakan_sore.replace(/\s/g, '') + "')"
            }
            con.query(query, function(err, result) {
                if (err) throw err;
                console.log("1 record changed");
                res.redirect('/single-feed');
            });
        });
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

    app.get('/admins', function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `administrator`", function(err, result) {
            //select all light sensor value and time from the database
            // if (err) throw err;
            res.render('single-feed', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page
            });
        });
    });

}