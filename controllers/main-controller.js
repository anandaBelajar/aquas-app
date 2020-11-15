var bodyParser = require('body-parser'),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    methodOverride = require('method-override'),
    multer = require('multer');
const { render } = require('ejs');

module.exports = function(app, con, path, passport) { //exports the function

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));

    const storage = multer.diskStorage({
        destination: path.join(__dirname + './../public/uploads/'),
        filename: function(req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() +
                path.extname(file.originalname));
        }
    });

    const upload = multer({ storage: storage }).single('picture');

    function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        res.redirect('/login')
    }

    function cehckNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/')
        }
        next()
    }

    app.get('/', checkAuthenticated, function(req, res) {
        //index route
        res.render('index', {
            name: req.user.nama,
            photo: req.user.foto,
        }); //render the ejs view for index page
    });

    app.get('/gentelella', function(req, res) {
        //index route
        res.render('gentelella-index'); //render the ejs view for index page
    });

    //Start Single Route
    app.get('/single-feed', checkAuthenticated, function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `jadwal_pakan`", function(err, result) {
            //select all light sensor value and time from the database
            // if (err) throw err;
            console.log(result)
            res.render('single-feed', {
                //render the ejs view for light detail page
                name: req.user.nama,
                items: result, //send the data from database to the light detail page
                photo: req.user.foto,

            });
        });
    });

    app.post('/single-feed', checkAuthenticated, function(req, res) {
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

    app.get('/single-light', checkAuthenticated, function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `data_cahaya` ORDER BY `waktu` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-light', {
                //render the ejs view for light detail page
                name: req.user.nama,
                items: result, //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });

    app.get('/single-temp', checkAuthenticated, function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `data_suhu` ORDER BY `waktu` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-temp', {
                //render the ejs view for light detail page
                name: req.user.nama,
                items: result, //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });

    app.get('/single-ph', checkAuthenticated, function(req, res) {
        //light detail page route
        con.query("SELECT * FROM `data_ph` ORDER BY `waktu` DESC", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-ph', {
                //render the ejs view for light detail page
                name: req.user.nama,
                items: result, //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });


    //End Single Route

    app.get('/admins', checkAuthenticated, function(req, res) {
        //light detail page route
        con.query("SELECT `id`, `nama`, `email` FROM `administrator`", function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            console.log(result)
            res.render('admin-manage', {
                //render the ejs view for light detail page
                name: req.user.nama,
                items: result, //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });

    app.get('/add-admin', checkAuthenticated, function(req, res) {
        //light detail page route
        res.render('admin-add', {
            name: req.user.nama,
            input_name: '',
            message: '',
            photo: req.user.foto,
        });
    });

    app.post('/add-admin', checkAuthenticated, function(req, res) {
        console.log('request was made : ' + req.url);

        var check_email_query = "SELECT email FROM `administrator` WHERE email = '" + req.body.email + "'",
            query = "INSERT INTO `administrator` (`nama`, `email`, `foto`,  `password`) VALUES (";

        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.render('admin-add', {
                message: 'Semua data harus diisi',
                id: req.user.id,
                name: req.user.nama,
                input_name: req.body.name,
                photo: req.user.foto,
            })
        }

        if (req.body.name.length > 100) {
            return res.render('admin-add', {
                message: 'nama maksimal 100 karakter',
                id: req.user.id,
                name: req.user.nama,
                input_name: req.body.name,
                photo: req.user.foto,
            })
        }

        if (req.body.email.length > 100) {
            return res.render('admin-add', {
                message: 'email maksimal 100 karakter',
                id: req.user.id,
                name: req.user.nama,
                input_name: req.body.name,
                photo: req.user.foto,
            })
        }

        if (req.body.password.length > 50) {
            return res.render('admin-add', {
                message: 'Password maksimal 50 karakter',
                id: req.user.id,
                name: req.user.nama,
                input_name: req.body.name,
                photo: req.user.foto,
            })
        }

        con.query(check_email_query, async function(err, result) {
            if (err) throw err;
            console.log(result);
            if (result.length > 0) {
                return res.render('admin-add', {
                    name: req.user.nama,
                    input_name: req.body.name,
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

    app.get('/login', cehckNotAuthenticated, function(req, res) {

        res.render('login', {
            message: ''
        });

    });

    app.post('/login', cehckNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }))

    app.delete('/logout', checkAuthenticated, function(req, res, next) {
        req.logOut()
        res.redirect('/login')
    })

    app.get('/profile', checkAuthenticated, function(req, res) {

        res.render('profile', {
            message_bio: '',
            message_photo: '',
            id: req.user.id,
            name: req.user.nama,
            email: req.user.email,
            photo: req.user.foto,
        });

    });

    app.post('/profile/:id/edit', checkAuthenticated, async function(req, res) {
        console.log('request was made : ' + req.url);
        let hashedPassword = await bcrypt.hash(req.body.password, 8)
            //console.log('this is what you call id : ' + req.body.nama)
        var query = "UPDATE `administrator` SET";
        query += "`nama` = '" + req.body.name + "',";
        query += "`email` = '" + req.body.email + "',";
        query += "`password` = '" + hashedPassword + "'";
        query += " WHERE `id` = '" + req.params.id + "'";

        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.render('profile', {
                message_bio: 'Semua data harus diisi',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
            })
        }

        if (req.body.name.length > 100) {
            return res.render('profile', {
                message_bio: 'nama maksimal 100 karakter',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
            })
        }

        if (req.body.email.length > 100) {
            return res.render('profile', {
                message_bio: 'email maksimal 100 karakter',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
            })
        }

        if (req.body.password.length > 50) {
            return res.render('profile', {
                message_bio: 'password maksimal 50 karakter',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
            })
        }

        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.render('profile', {
                message_bio: 'Semua data harus diisi',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
            })
        }

        con.query(query, function(err, result) {
            if (err) throw err;
            if (result.affectedRows) {
                console.log("1 record changed");
                res.redirect('/profile');
            }
        });

    });

    app.get('*', checkAuthenticated, function(req, res) {
        res.status(404).render('404');
    });

    app.post('/profile/:id/edit/photo', function(req, res) {
        upload(req, res, err => {

            if (!req.file) {
                return res.render('profile', {
                    message_bio: '',
                    message_photo: 'Belum memilih foto',
                    id: req.user.id,
                    name: req.user.nama,
                    email: req.user.email,
                    photo: req.user.foto,
                })
            }

            if (err) throw err;
            var query = "UPDATE `administrator` SET";
            query += "`foto` = '" + req.file.filename + "'";
            query += " WHERE `administrator`.`id`= " + req.params.id + "";
            console.log(req.params.id);
            con.query(query, function(err, results) {
                res.redirect('/profile')
            });
        });
    });





}