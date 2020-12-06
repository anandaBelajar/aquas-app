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
        aquas_servo_topic = 'aquas/servo'

    var current_feed = "",
        current_temp = "",
        current_ph = ""

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
        //fire the function when message coming

        //get current date time value
        var date = new Date();
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var dateonly = year + "-" + month + "-" + day
        var time = hour + ':' + minutes + ':' + seconds; //current time to display on front end
        var dbDateTime = year + "-" + month + "-" + day + "- " + hour + ":" + minutes + ":" + seconds; //date time to save in database

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
            console.log('mail coming')
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
            } else if (message.toString() == 'peringatan_suhu') {
                jenis = 'peringatan_suhu'
                subject = "peringatan"
                content = 'Kondisi suhu saat ini tidak baik : ' + current_temp + 'celcius, mohon segera lakukan pemeriksaan'
            } else if (message.toString() == 'peringatan_ph') {
                jenis = 'peringatan_ph'
                subject = "peringatan"
                content = 'Kondisi ph saat ini tidak baik : ' + current_ph + 'mohon segera lakukan pemeriksaan'
            }

            query += "SELECT jenis FROM notifikasi WHERE jenis = '" + jenis + "';"
            query += "SELECT tanggal FROM notifikasi WHERE tanggal ='" + dateonly + "';"
                //query += "SELECT tanggal FROM notifikasi;"

            con.query(query, function(err, result) {
                //console.log(dateonly + "T16:00:00.000Z")
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

                        console.log(item['id'])
                        console.log(item['email'])
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



    });




}