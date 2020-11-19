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

        var query = "SELECT * FROM `status_aktuator`;"
        query += "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5 "
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            //index route
            console.log(result[1])
            res.render('index', {
                name: req.user.nama,
                photo: req.user.foto,
                items: result[0],
                notifikasi: result[1],
            }); //render the ejs view for index page
        });
    });

    app.get('/notifications', checkAuthenticated, function(req, res) {

        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `notifikasi` WHERE id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC'"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            //index route
            console.log(result[1])
            res.render('notifications', {
                name: req.user.nama,
                photo: req.user.foto,
                notifikasi: result[0],
                items: result[1],
            }); //render the ejs view for index page
        });
    });

    app.get('/notification-detail/:id', checkAuthenticated, function(req, res) {

        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `notifikasi` WHERE id ='" + req.params.id + "';"
        query += "UPDATE `notifikasi` set status = 'read' WHERE id ='" + req.params.id + "';"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            //index route
            console.log(result[1])
            res.render('notification-detail', {
                name: req.user.nama,
                photo: req.user.foto,
                notifikasi: result[0],
                item: result[1],
            }); //render the ejs view for index page
        });
    });

    app.get('/gentelella', function(req, res) {
        //index route
        res.render('gentelella-index'); //render the ejs view for index page
    });

    //Start Single Route
    app.get('/single-feed', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `status_aktuator`; "
        query += "SELECT * FROM `jadwal_pakan`"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-feed', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                input_items: result[1],
                form_items: result[2], //send the data from database to the light detail page
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
        //var query = "SELECT * FROM `data_cahaya` ORDER BY `waktu` DESC"
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `status_aktuator`; "
        query += "SELECT * FROM `data_cahaya` ORDER BY `waktu` DESC"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-light', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                input_items: result[1],
                table_items: result[2], //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });

    app.get('/single-temp', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `data_suhu` ORDER BY `waktu` DESC"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-temp', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                items: result[1], //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });

    app.get('/single-ph', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `data_ph` ORDER BY `waktu` DESC"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-ph', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                items: result[1], //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });


    //End Single Route

    app.get('/admins', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT `id`, `nama`, `email` FROM `administrator`"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            console.log(result)
            res.render('admin-manage', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                items: result[1], //send the data from database to the light detail page
                photo: req.user.foto,
            });
        });
    });

    app.get('/add-admin', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            console.log(result)
            res.render('admin-add', {
                notifikasi: result,
                name: req.user.nama,
                input_name: '',
                message: '',
                photo: req.user.foto,
            });
        });
    });

    app.post('/add-admin', checkAuthenticated, function(req, res) {
        console.log('request was made : ' + req.url);

        var query = "SELECT email FROM `administrator` WHERE email = '" + req.body.email + "';",
            insert_query = "INSERT INTO `administrator` (`nama`, `email`, `foto`,  `password`) VALUES (",
            error_message = "",
            can_check_email = true

        query += " SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"

        if (!req.body.name || !req.body.email || !req.body.password) {
            error_message = "semua data harus diisi"
            can_check_email = false
        }

        if (req.body.name.length > 100) {
            error_message = 'nama maksimal 100 karakter'
            can_check_email = false
        }

        if (req.body.email.length > 100) {
            error_message = 'email maksimal 100 karakter'
            can_check_email = false
        }

        if (req.body.password.length > 50) {
            error_message = 'Password maksimal 50 karakter'
            can_check_email = false
        }

        if (error_message.length) {
            con.query(query, function(err, result) {
                if (err) throw err;
                return res.render('admin-add', {
                    message: error_message,
                    id: req.user.id,
                    name: req.user.nama,
                    input_name: req.body.name,
                    photo: req.user.foto,
                    notifikasi: result[1],
                })
            })
        } else {
            con.query(query, async function(err, result) {
                if (err) throw err;
                if (result[0].length > 0) {
                    return con.query(query, function(err, result) {
                        if (err) throw err;
                        res.render('admin-add', {
                            message: 'Email sudah digunakan',
                            id: req.user.id,
                            name: req.user.nama,
                            input_name: req.body.name,
                            photo: req.user.foto,
                            notifikasi: result[1],
                        })
                    })
                } else {
                    let hashedPassword = await bcrypt.hash(req.body.password, 8)
                    insert_query += "'" + req.body.name + "',";
                    insert_query += "'" + req.body.email + "',";
                    insert_query += "'" + "/uploads/default-avatar.png" + "',";
                    insert_query += "'" + hashedPassword + "')";

                    con.query(insert_query, function(err, result) {
                        if (err) throw err;
                        console.log("1 record changed");
                        res.redirect('/admins');
                    });
                }
            })
        }
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
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            console.log(result)
            res.render('profile', {
                message_bio: '',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
                notifikasi: result
            });
        });


    });

    app.post('/profile/:id/edit', checkAuthenticated, async function(req, res) {
        console.log('request was made : ' + req.url);
        let hashedPassword = await bcrypt.hash(req.body.password, 8)
            //console.log('this is what you call id : ' + req.body.nama)
        var update_query = "UPDATE `administrator` SET";
        update_query += "`nama` = '" + req.body.name + "',";
        update_query += "`email` = '" + req.body.email + "',";
        update_query += "`password` = '" + hashedPassword + "'";
        update_query += " WHERE `id` = '" + req.params.id + "'";

        var query = "SELECT email FROM `administrator` WHERE email = '" + req.body.email + "';"
        query += "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;",
            message_bio = 0

        if (!req.body.name || !req.body.email || !req.body.password) {
            message_bio = 'Semua data harus diisi'
        }

        if (req.body.name.length > 100) {
            message_bio = 'nama maksimal 100 karakter'
        }

        if (req.body.email.length > 100) {
            message_bio = 'email maksimal 100 karakter'
        }

        if (req.body.password.length > 50) {
            message_bio = 'password maksimal 50 karakter'
        }


        if (message_bio.length) {
            con.query(query, function(err, result) {
                if (err) throw err;
                return res.render('profile', {
                    message_bio: message_bio,
                    message_photo: '',
                    id: req.user.id,
                    name: req.user.nama,
                    email: req.user.email,
                    photo: req.user.foto,
                    notifikasi: result[1]
                })
            });
        } else {
            con.query(query, async function(err, result) {
                if (err) throw err;
                if (req.body.email != req.user.email) {
                    if (result[0].length > 0) {
                        con.query(query, function(err, result) {
                            if (err) throw err;
                            return res.render('profile', {
                                message_bio: 'Email sudah digunakan',
                                message_photo: '',
                                id: req.user.id,
                                name: req.user.nama,
                                email: req.user.email,
                                photo: req.user.foto,
                                notifikasi: result[1]
                            })
                        })
                    } else {
                        con.query(update_query, function(err, result) {
                            if (err) throw err;
                            if (result.affectedRows) {
                                console.log("1 record changed");
                                res.redirect('/profile');
                            }
                        });
                    }
                } else {
                    con.query(update_query, function(err, result) {
                        if (err) throw err;
                        if (result.affectedRows) {
                            console.log("1 record changed");
                            res.redirect('/profile');
                        }
                    });
                }
            })

        }
    });

    app.post('/profile/:id/edit/photo', function(req, res) {
        upload(req, res, err => {

            if (!req.file) {
                con.query("SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;", function(err, result) {
                    if (err) throw err;
                    return res.render('profile', {
                        message_bio: '',
                        message_photo: 'Belum memilih foto',
                        id: req.user.id,
                        name: req.user.nama,
                        email: req.user.email,
                        photo: req.user.foto,
                        notifikasi: result
                    })
                });
            } else {
                if (err) throw err;
                var query = "UPDATE `administrator` SET";
                query += "`foto` = '" + req.file.filename + "'";
                query += " WHERE `administrator`.`id`= " + req.params.id + "";
                console.log(req.params.id);
                con.query(query, function(err, results) {
                    res.redirect('/profile')
                });
            }
        });
    });

    app.get('*', checkAuthenticated, function(req, res) {
        res.status(404).render('404');
    });







}