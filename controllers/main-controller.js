var bodyParser = require('body-parser'),
    async = require('async'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcryptjs')



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
            console.log(result)
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
        console.log('sinle-feed acessed')
        con.query(check_table_query, function(err, result) {
            if (err) throw err;
            console.log(result);
            if (result.length < 1) {
                query = 'INSERT INTO jadwal_pakan(jenis, waktu) VALUES ';
                query += "('pagi','" + req.body.waktu_pakan_pagi.replace(/\s/g, '') + "'),"
                query += "('siang','" + req.body.waktu_pakan_siang.replace(/\s/g, '') + "'),"
                query += "('sore','" + req.body.waktu_pakan_sore.replace(/\s/g, '') + "')"
            }
            con.query(query, function(err, result) {
                if (err) throw err;
                console.log("1 record changed");
                res.redirect('/');
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
        con.query("SELECT `id`, `nama`, `email` FROM `administrator`", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            console.log(result)
            res.render('admin-manage', {
                //render the ejs view for light detail page
                items: result, //send the data from database to the light detail page

            });
        });
    });

    app.get('/add-admin', function(req, res) {
        //light detail page route
        res.render('admin-add', {
            name: '',
            message: '',
        });
    });

    app.post('/add-admin', function(req, res) {
        console.log('request was made : ' + req.url);

        var check_email_query = "SELECT email FROM `administrator` WHERE email = '" + req.body.email + "'",
            query = "INSERT INTO `administrator` (`nama`, `email`, `foto`,  `password`) VALUES (";

        con.query(check_email_query, async function(err, result) {
            if (err) throw err;
            console.log(result);
            if (result.length > 0) {
                return res.render('admin-add', {
                    name: req.body.name,
                    message: 'Email tersebut sudah digunakan'
                })
            }

            let hashedPassword = await bcrypt.hash(req.body.password, 8)
            query += "'" + req.body.name + "',";
            query += "'" + req.body.email + "',";
            query += "'" + "/uploads/default-avatar.png" + "',";
            query += "'" + hashedPassword + "')";

            // console.log(hashedPassword)
            //     // res.render('admin-add', {
            //     //     message: 'Email tersebut sudah digunakan'
            //     // })
            con.query(query, function(err, result) {
                if (err) throw err;
                console.log("1 record changed");
                res.redirect('/admins');
            });
        })
    });

    app.get('/login', function(req, res) {

        res.render('login');

    });



}