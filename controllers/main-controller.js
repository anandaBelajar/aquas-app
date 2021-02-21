var bodyParser = require('body-parser'),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    methodOverride = require('method-override'),
    multer = require('multer');
const { render } = require('ejs')


module.exports = function(app, con, path, passport) {

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
        query += "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            //index route
            res.render('index', {
                name: req.user.nama,
                photo: req.user.foto,
                items: result[0],
                notifikasi: result[1],
                notifqty: result[2][0]['count']
            }); //render the ejs view for index page
        });
    });

    app.get('/notifications', checkAuthenticated, function(req, res) {

        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `notifikasi` WHERE id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC';"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            //index route

            res.render('notifications', {
                name: req.user.nama,
                photo: req.user.foto,
                notifikasi: result[0],
                items: result[1],
                notifqty: result[2][0]['count']
            }); //render the ejs view for index page
        });
    });

    app.get('/notification-detail/:id', checkAuthenticated, function(req, res) {

        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `notifikasi` WHERE id ='" + req.params.id + "';"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        query += "UPDATE `notifikasi` set status = 'read' WHERE id ='" + req.params.id + "';",


            con.query(query, function(err, result) {
                //select all light sensor value and time from the database
                if (err) throw err;
                //index route

                res.render('notification-detail', {
                    name: req.user.nama,
                    photo: req.user.foto,
                    notifikasi: result[0],
                    item: result[1],
                    notifqty: result[2][0]['count']
                }); //render the ejs view for index page
            });
    });


    //Start Single Route
    app.get('/single-feed', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `status_aktuator`; "
        query += "SELECT * FROM `jadwal_aktuator` WHERE aktuator='servo';"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        query += "SELECT `limit` FROM `limit_aktuator` WHERE `jenis` = 'timeout_pintu_pakan';";
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
                notifqty: result[3][0]['count'],
                timeout_pakan: result[4][0]['limit']
            });
        });
    });

    app.post('/single-feed', checkAuthenticated, function(req, res) {
        var check_table_query = "SELECT * FROM `jadwal_aktuator` WHERE aktuator='servo'",
            query = "UPDATE `jadwal_aktuator` SET `waktu` = '" + req.body.waktu_pakan_pagi.replace(/\s/g, '') + "' WHERE `jadwal_aktuator`.`jenis` = 'pagi';";
        query += " UPDATE `jadwal_aktuator` SET `waktu` = '" + req.body.waktu_pakan_siang.replace(/\s/g, '') + "' WHERE `jadwal_aktuator`.`jenis` = 'siang';";
        query += " UPDATE `jadwal_aktuator` SET `waktu` = '" + req.body.waktu_pakan_sore.replace(/\s/g, '') + "' WHERE `jadwal_aktuator`.`jenis` = 'sore';";

        con.query(check_table_query, function(err, result) {
            if (err) throw err;

            if (result.length < 1) {
                query = 'INSERT INTO jadwal_aktuator(aktuator, jenis, waktu) VALUES ';
                query += "('servo', 'pagi','" + req.body.waktu_pakan_pagi.replace(/\s/g, '') + "'),"
                query += "('servo', 'siang','" + req.body.waktu_pakan_siang.replace(/\s/g, '') + "'),"
                query += "('servo', 'sore','" + req.body.waktu_pakan_sore.replace(/\s/g, '') + "')"
            }
            con.query(query, function(err, result) {
                if (err) throw err;
                res.redirect('/single-feed');
            });
        });
    });

    app.post('/feeder-timeout-setting', checkAuthenticated, function(req, res) {
        var check_table_query = "SELECT `limit` FROM `limit_aktuator` WHERE  `limit_aktuator`.`jenis` = 'timeout_pintu_pakan'",
            query = "UPDATE `limit_aktuator` SET `limit` =" + req.body.timeout_pintu_pakan + " WHERE `limit_aktuator`.`jenis` = 'timeout_pintu_pakan';";


        con.query(check_table_query, function(err, result) {
            if (err) throw err;

            if (result.length < 1) {
                query = "INSERT INTO limit_aktuator(jenis, limit) VALUES ('timeout_pintu_pakan'," + req.body.timeout_pintu_pakan + ");"
            }
            con.query(query, function(err, result) {
                if (err) throw err;
                res.redirect('/single-feed');
            });
        });
    });

    app.get('/single-light', checkAuthenticated, function(req, res) {
        //light detail page route
        //var query = "SELECT * FROM `data_cahaya` ORDER BY `waktu` DESC"
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `status_aktuator`; "
        query += "SELECT * FROM `jadwal_aktuator` WHERE aktuator='growlight';"
        query += "SELECT * FROM `data_cahaya` ORDER BY `waktu` DESC;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        query += "SELECT `limit` FROM limit_aktuator WHERE `jenis` = 'limit_cahaya_growlight';"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-light', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                input_items: result[1],
                form_items: result[2],
                table_items: result[3], //send the data from database to the light detail page
                photo: req.user.foto,
                notifqty: result[4][0]['count'],
                growlight_light_limit: result[5][0]['limit']
            });
        });
    });

    app.post('/lighting-schedule', checkAuthenticated, function(req, res) {
        var check_table_query = "SELECT * FROM `jadwal_aktuator` WHERE aktuator='growlight'",
            query = "UPDATE `jadwal_aktuator` SET `waktu` = '" + req.body.waktu_pencahayaan_mulai.replace(/\s/g, '') + "' WHERE `jadwal_aktuator`.`jenis` = 'mulai';";
        query += " UPDATE `jadwal_aktuator` SET `waktu` = '" + req.body.waktu_pencahayaan_selesai.replace(/\s/g, '') + "' WHERE `jadwal_aktuator`.`jenis` = 'selesai';";

        con.query(check_table_query, function(err, result) {
            if (err) throw err;

            if (result.length < 1) {
                query = 'INSERT INTO jadwal_aktuator(aktuator, jenis, waktu) VALUES ';
                query += "('growlight', 'mulai','" + req.body.waktu_pencahayaan_mulai.replace(/\s/g, '') + "'),"
                query += "('growlight', 'selesai','" + req.body.waktu_pencahayaan_selesai.replace(/\s/g, '') + "')"
            }
            con.query(query, function(err, result) {
                if (err) throw err;
                res.redirect('/single-light');
            });
        });
    });

    app.post('/growlight-light-limit-setting', checkAuthenticated, function(req, res) {
        var check_table_query = "SELECT `limit` FROM `limit_aktuator` WHERE  `limit_aktuator`.`jenis` = 'timeout_pintu_pakan'",
            query = "UPDATE `limit_aktuator` SET `limit` =" + req.body.growlight_light_limit + " WHERE `limit_aktuator`.`jenis` = 'limit_cahaya_growlight';";


        con.query(check_table_query, function(err, result) {
            if (err) throw err;

            if (result.length < 1) {
                query = "INSERT INTO limit_aktuator(jenis, limit) VALUES ('limit_cahaya_growlight'," + req.body.growlight_light_limit + ");"
            }
            con.query(query, function(err, result) {
                if (err) throw err;
                res.redirect('/single-light');
            });
        });
    });

    app.get('/single-temp', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `data_suhu` ORDER BY `waktu` DESC;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"

        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-temp', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                items: result[1], //send the data from database to the light detail page
                photo: req.user.foto,
                notifqty: result[2][0]['count']
            });
        });
    });

    app.get('/single-ph', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT * FROM `data_ph` ORDER BY `waktu` DESC;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;
            res.render('single-ph', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                items: result[1], //send the data from database to the light detail page
                photo: req.user.foto,
                notifqty: result[2][0]['count']
            });
        });
    });


    //End Single Route

    app.get('/admins', checkAuthenticated, function(req, res) {
        //light detail page route
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT `id`, `nama`, `email` FROM `administrator`;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;

            res.render('admin-manage', {
                //render the ejs view for light detail page
                name: req.user.nama,
                notifikasi: result[0],
                items: result[1], //send the data from database to the light detail page
                photo: req.user.foto,
                notifqty: result[2][0]['count']
            });
        });
    });

    app.get('/add-admin', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;

            res.render('admin-add', {
                notifikasi: result,
                name: req.user.nama,
                input_name: '',
                message: '',
                photo: req.user.foto,
                notifqty: result[1][0]['count']
            });
        });
    });

    app.post('/add-admin', checkAuthenticated, function(req, res) {
        var query = "SELECT email FROM `administrator` WHERE email = '" + req.body.email + "';",
            insert_query = "INSERT INTO `administrator` (`nama`, `email`, `foto`,  `password`) VALUES ("


        query += " SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"

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
                        notifqty: result[2][0]['count']
                    })
                })
            } else {
                let hashedPassword = await bcrypt.hash(req.body.password, 8)
                insert_query += "'" + req.body.name + "',";
                insert_query += "'" + req.body.email + "',";
                insert_query += "'" + "no_profile.png" + "',";
                insert_query += "'" + hashedPassword + "')";

                con.query(insert_query, function(err, result) {
                    if (err) throw err;
                    res.redirect('/admins');
                });
            }
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
        var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        con.query(query, function(err, result) {
            //select all light sensor value and time from the database
            if (err) throw err;

            res.render('profile', {
                message_bio: '',
                message_photo: '',
                id: req.user.id,
                name: req.user.nama,
                email: req.user.email,
                photo: req.user.foto,
                notifikasi: result,
                notifqty: result[1][0]['count']
            });
        });


    });

    app.post('/profile/:id/edit', checkAuthenticated, async function(req, res) {
        let hashedPassword = await bcrypt.hash(req.body.password, 8)
        var update_query = "UPDATE `administrator` SET";
        update_query += "`nama` = '" + req.body.name + "',";
        update_query += "`email` = '" + req.body.email + "',";
        update_query += "`password` = '" + hashedPassword + "'";
        update_query += " WHERE `id` = '" + req.params.id + "'";

        var query = "SELECT email FROM `administrator` WHERE email = '" + req.body.email + "';"
        query += "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
        query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
        message_bio = 0

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
                            notifikasi: result[1],
                            notifqty: [2][0]['count']
                        })
                    })
                } else {
                    con.query(update_query, function(err, result) {
                        if (err) throw err;
                        if (result.affectedRows) {
                            res.redirect('/profile');
                        }
                    });
                }
            } else {
                con.query(update_query, function(err, result) {
                    if (err) throw err;
                    if (result.affectedRows) {
                        res.redirect('/profile');
                    }
                });
            }
        })


    });

    app.post('/profile/:id/edit/photo', function(req, res) {
        upload(req, res, err => {

            if (!req.file) {
                var query = "SELECT * FROM `notifikasi` WHERE status = 'unread' AND id_administrator =" + req.user.id + " ORDER BY 'tanggal' 'DESC' LIMIT 5;"
                query += "SELECT COUNT(id) AS count FROM notifikasi WHERE status='unread' AND id_administrator =" + req.user.id + ";"
                con.query(query, function(err, result) {
                    if (err) throw err;
                    return res.render('profile', {
                        message_bio: '',
                        message_photo: 'Belum memilih foto',
                        id: req.user.id,
                        name: req.user.nama,
                        email: req.user.email,
                        photo: req.user.foto,
                        notifikasi: result,
                        notifqty: result[1][0]['count'],
                    })
                });
            } else {
                if (err) throw err;
                var query = "UPDATE `administrator` SET";
                query += "`foto` = '" + req.file.filename + "'";
                query += " WHERE `administrator`.`id`= " + req.params.id + "";

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