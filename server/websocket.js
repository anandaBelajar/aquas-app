/*
Backend Websocket
*/

var socket = require('socket.io'); //require socket.io package
let mqtt = require('mqtt'); //require mqtt package
const nodemailer = require('nodemailer');


module.exports = function(server, con) { //exports the function

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    //let client = mqtt.connect(process.env.MQTT_LOCAL_BROKER);
    let client = mqtt.connect(process.env.VPS_MQTT_BROKER, {
        username: process.env.VPS_MQTT_USER,
        password: process.env.VPS_MQTT_PASS,

    });

    var io = socket(server); //pass the server as socket parameter

    var topic = [
            'aquas/feed',
            'aquas/light',
            'aquas/temp',
            'aquas/ph',
            'aquas/mail'
        ],
        aquas_pump_topic = 'aquas/pump',
        aquas_growlight_topic = 'aquas/growlight',
        aquas_servo_topic = 'aquas/servo',
        aquas_time_topic = 'aquas/time'


    var current_feed = "",
        current_temp = "",
        current_ph = "",
        jadwal_pakan_pagi = "",
        jadwal_pakan_siang = "",
        jadwal_pakan_sore = ""


    client.on('connect', function() {
        console.log('connected to a broker...'); //console log whe connection to broker success
        topic.forEach(function(value, index) {
            client.subscribe(value, function(err) {
                //display subscribed topic when mqtt connection to broker success
                console.log('subscribed to topic : ' + value);
            })
        });
    })

    client.on('message', function(topic, message) {

        var date = new Date(),
            seconds = date.getSeconds(),
            minutes = date.getMinutes(),
            hour = date.getHours(),
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate(),
            dateonly = year + "-" + month + "-" + day,
            time = hour + ':' + minutes + ':' + seconds, //current time to display on front end
            dbDateTime = year + "-" + month + "-" + day + "- " + hour + ":" + minutes + ":" + seconds; //date time to save in database

        //fire the function when message coming
        if (topic == 'aquas/feed') {
            current_feed = message.toString()
            var feed = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_feed_msg_arrive', feed); //send sensor value and current time to frontend websocket
        } else
        if (topic == 'aquas/light') {
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `data_cahaya` (`data`, `waktu`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var light = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_light_msg_arrive', light); //send sensor value and current time to frontend websocket

            /*
            if (hour == 8 && minutes == 0 && seconds == 0 && message.toString() >= 50) {
                //at 08.00 AM if and the moisture equal or higer than 50 % turn on the pump 
                client.publish(pubTopic, 'on'); //publish the messsage
            } else if (message.toString() <= 30) {
                //always turn off the pump if moisture lower or equal to 30% 
                client.publish(pubTopic, 'off'); //publish the messsage

            }
            */

        } else if (topic == 'aquas/temp') {
            current_temp = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `data_suhu` (`data`, `waktu`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var temp = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_temp_msg_arrive', temp);
        } else if (topic == 'aquas/ph') {
            current_ph = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `data_ph` (`data`, `waktu`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var ph = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_ph_msg_arrive', ph);
        } else if (topic == 'aquas/mail') {
            var query = "SELECT id, email FROM administrator;",
                notif_query = "",
                jenis = "",
                subject = "",
                content = "",
                rec_email = []

            if (message.toString() == 'pemberitahuan_pakan') {
                jenis = 'pemberitahuan_pakan'
                subject = "pemberitahuan"
                content = 'Sisa pakan sebanyak ' + current_feed + "%"
            } else if (message.toString() == 'peringatan_pakan') {
                jenis = 'peringatan_pakan'
                subject = "peringatan"
                content = 'Sisa pakan sebanyak ' + current_feed + '%, mohon segera lakukan isi ulang'
            } else if (message.toString() == 'peringatan_suhu_rendah') {
                jenis = 'peringatan_suhu_rendah'
                subject = "peringatan"
                content = 'Kondisi suhu saat ini terlalu rendah : ' + current_temp + 'celcius, mohon segera lakukan pemeriksaan'
            } else if (message.toString() == 'peringatan_suhu_tinggi') {
                jenis = 'peringatan_suhu_tinggi'
                subject = "peringatan"
                content = 'Kondisi suhu saat ini terlalu tinggi : ' + current_temp + 'celcius, mohon segera lakukan pemeriksaan'
            } else if (message.toString() == 'peringatan_ph_rendah') {
                jenis = 'peringatan_ph_rendah'
                subject = "peringatan"
                content = 'Kondisi ph saat ini teralu rendah : ' + current_ph + 'mohon segera lakukan pemeriksaan'
            } else if (message.toString() == 'peringatan_ph_tinggi') {
                jenis = 'peringatan_ph_tinggi'
                subject = "peringatan"
                content = 'Kondisi ph saat ini terlalu tinggi : ' + current_ph + 'mohon segera lakukan pemeriksaan'
            }

            query += "SELECT jenis FROM notifikasi WHERE jenis = '" + jenis + "';"
            query += "SELECT tanggal FROM notifikasi WHERE tanggal ='" + dateonly + "';"
                //query += "SELECT tanggal FROM notifikasi;"

            con.query(query, function(err, result) {
                if (err) throw err;
                if (!(result[0].length && result[1].length && result[2].length)) {
                    result[0].forEach(function(item) {

                        notif_query += "INSERT INTO `notifikasi` (`jenis`, `subject`,`tanggal`, `waktu`, `deskripsi`, `status`, `id_administrator`) VALUES (";
                        notif_query += "'" + jenis + "',";
                        notif_query += "'" + subject + "',";
                        notif_query += "'" + dateonly + "',";
                        notif_query += "'" + time + "',";
                        notif_query += "'" + content + "',";
                        notif_query += "'" + 'unread' + "',";
                        notif_query += "'" + item['id'] + "');";

                        rec_email.push(item['email'])
                    });
                    con.query(notif_query, function(err, result) {
                        if (err) throw err;
                    });
                    let mailOptions = {
                        //email data
                        from: process.env.EMAIL,
                        to: rec_email,
                        subject: jenis,
                        text: content
                    }

                    transporter.sendMail(mailOptions, function(err, data) {
                        //send the email
                        if (err) {
                            //send the error message if there are any error
                            console.log(err);
                        } else {
                            //show email sent when there ae no error
                            console.log('Email sent!');
                        }
                    });
                }
            });
        }
    })

    io.on('connection', function(socket) {

        //Start servo socket event
        socket.on('servo_auto', function() {
            var status_type = 'servo_auto',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'auto' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('servo_auto');
            client.publish(aquas_servo_topic, 'auto'); //publish the messsage
        });

        socket.on('servo_manual', function() {
            var status_type = 'servo_auto',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'manual' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('servo_manual');
            client.publish(aquas_servo_topic, 'manual'); //publish the messsage
        });

        socket.on('servo_open', function() {
            //servo open close status doesn't need to be saved in database because it using javascript interval timer
            io.sockets.emit('servo_open');
            client.publish(aquas_servo_topic, 'open'); //publish the messsage
            setTimeout(function() {
                io.sockets.emit('servo_close');
                client.publish(aquas_servo_topic, 'close'); //publish the messsage
            }, 3000)
        });

        // socket.on('servo_close', function() {
        //     //servo open close status doesn't need to be saved in database because it using javascript interval timer
        //     //io.sockets.emit('servo_close');
        //     client.publish(aquas_servo_topic, 'close'); //publish the messsage
        // });
        //End servo socket event

        //Start pump event Socket
        socket.on('pump_on', function() {
            var status_type = 'pump_manual',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'on' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('pump_on');
            client.publish(aquas_pump_topic, 'on'); //publish the messsage
        });

        socket.on('pump_off', function() {
            var status_type = 'pump_manual',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'off' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('pump_off');
            client.publish(aquas_pump_topic, 'off'); //publish the messsage
        });
        //End pump event Socket

        //Start light socket event
        socket.on('grow_light_auto', function() {
            var status_type = 'grow_light_auto',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'auto' + "'";
            query += " WHERE `jenis` = '" + status_type + "';";
            query += "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'off' + "'";
            query += " WHERE `jenis` = 'grow_light_manual';";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('grow_light_auto');
            client.publish(aquas_growlight_topic, 'auto'); //publish the messsage
        });

        socket.on('grow_light_manual', function() {
            var status_type = 'grow_light_auto',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'manual' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('grow_light_manual');
            client.publish(aquas_growlight_topic, 'manual'); //publish the messsage
        });

        socket.on('grow_light_on', function() {
            var status_type = 'grow_light_manual',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'on' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('grow_light_on');
            client.publish(aquas_growlight_topic, 'on'); //publish the messsage
        });

        socket.on('grow_light_off', function() {
            var status_type = 'grow_light_manual',
                check_query = "SELECT * FROM  `status_aktuator` WHERE jenis = '" + status_type + "'",
                query = "UPDATE `status_aktuator` SET";
            query += "`status` = '" + 'off' + "'";
            query += " WHERE `jenis` = '" + status_type + "'";
            con.query(check_query, function(err, result) {
                if (err) throw err;
                if (result.length) {
                    con.query(query);
                }
            });
            io.sockets.emit('grow_light_off');
            client.publish(aquas_growlight_topic, 'off'); //publish the messsage
        });
        //End light socket event

        socket.on('feed_schedule_changed', function(data) {
            jadwal_pakan_pagi = data['input_pakan_pagi'] + " : 00";
            jadwal_pakan_siang = data['input_pakan_siang'] + " : 00";
            jadwal_pakan_sore = data['input_pakan_sore'] + " : 00";
        });



    });

    setInterval(function() {

        var date = new Date(),
            seconds = date.getSeconds() < 10 ? '0' + String(date.getSeconds()) : date.getSeconds(),
            minutes = date.getMinutes() < 10 ? '0' + String(date.getMinutes()) : date.getMinutes(),
            hour = date.getHours() < 10 ? '0' + String(date.getHours()) : date.getHours(),
            time = hour + ':' + minutes + ':' + seconds //current time to display on front end
        var query = "SELECT waktu FROM  `jadwal_pakan`"

        con.query(query, function(err, result) {
            if (err) throw err;
            if (result.length) {
                if (result[0]['waktu'] == time || result[1]['waktu'] == time || result[2]['waktu'] == time) {
                    console.log('waktu pakan')
                    client.publish(aquas_servo_topic, 'open'); //publish the messsage
                    setTimeout(function() {
                        client.publish(aquas_servo_topic, 'close'); //publish the messsage
                    }, 3000)
                }
            }
        });

        client.publish(aquas_time_topic, String(hour)); //publish the messsage
    }, 1000);





}