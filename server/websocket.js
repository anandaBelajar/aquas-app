var socket = require('socket.io');
let mqtt = require('mqtt');
const nodemailer = require('nodemailer');


module.exports = function(server, con) {


    let transporter = nodemailer.createTransport({
            //gmail credential transporter configuration
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        }),
        client = mqtt.connect(process.env.VPS_MQTT_BROKER, {
            //mqtt credential configuration
            username: process.env.VPS_MQTT_USER,
            password: process.env.VPS_MQTT_PASS,

        });

    var io = socket(server),
        topic = [
            //subscribed topic
            'aquas/feed',
            'aquas/light',
            'aquas/temp',
            'aquas/ph',
            'aquas/mail',
            'aquas/remove-loader'
        ],
        //publised topic
        aquas_pump_topic = 'aquas/pump',
        aquas_growlight_topic = 'aquas/growlight',
        aquas_growlight_manual_topic = 'aquas/growlight_manual',
        aquas_servo_topic = 'aquas/servo',
        aquas_time_topic = 'aquas/time',
        //global current sensor value
        current_feed = "",
        current_temp = "",
        current_ph = ""

    //connect to mqtt broker
    client.on('connect', function() {
        console.log('connected to a broker...');

        //Start Sync actuator database and microcontroller status
        var query = "SELECT * FROM status_aktuator"
        con.query(query, function(err, results) {
            if (err) throw err;
            if (results.length) {
                var growlight_auto_status = "auto";
                results.forEach((item, index) => {
                    if (item['jenis'] == 'pump_manual') {
                        client.publish(aquas_pump_topic, item['status'])
                    } else if (item['jenis'] == 'grow_light_auto') {
                        client.publish(aquas_growlight_topic, item['status'])
                        growlight_auto_status = item['status'];
                    } else if (item['jenis'] == 'grow_light_manual' && growlight_auto_status == 'manual') {
                        client.publish(aquas_growlight_manual_topic, item['status'])
                    }
                })
            }
        });
        //End Sync actuator database and microcontroller status

        //Subscribe to specified topic
        topic.forEach(function(value, index) {
            client.subscribe(value, function(err) {
                console.log('subscribed to topic : ' + value);
            })
        });
    })


    client.on('message', function(topic, message) {

        //get servetr current date and time
        var date = new Date(),
            seconds = date.getSeconds(),
            minutes = date.getMinutes(),
            hour = date.getHours(),
            year = date.getFullYear(),
            month = parseInt(date.getMonth()) + 1,
            day = date.getDate(),
            dateonly = year + "-" + month + "-" + day,
            time = hour + ':' + minutes + ':' + seconds,
            dbDateTime = year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds; //date time to save in database
        if (topic == 'aquas/feed') {
            //MQTT feed value handler
            current_feed = Math.trunc(100 * ((parseFloat(message.toString()) - 0) / (23 - 0)))
            var feed = current_feed <= 100 ? [current_feed, time] : [100, time];
            io.sockets.emit('aquas_feed_msg_arrive', feed);
        } else if (topic == 'aquas/light') {
            //MQTT light value handler
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_cahaya` (`data`, `waktu`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                });
            }
            var light = [message.toString(), time];
            io.sockets.emit('aquas_light_msg_arrive', light);

        } else if (topic == 'aquas/temp') {
            //MQTT temprature value handler
            current_temp = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_suhu` (`data`, `waktu`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var temp = [message.toString(), time];
            io.sockets.emit('aquas_temp_msg_arrive', temp);
        } else if (topic == 'aquas/ph') {
            //MQTT ph value handler
            current_ph = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_ph` (`data`, `waktu`) VALUES (";
                sql += "'" + message.toString() + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var ph = [message.toString(), time];
            io.sockets.emit('aquas_ph_msg_arrive', ph);
        } else if (topic == "aquas/remove-loader") {
            //MQTT actuator loading animation handler
            var message = message.toString().split("/")

            if (message[0] == "pump") {
                io.sockets.emit('remove_pump_loader', message[1]);
            } else if (message[0] == "servo") {
                io.sockets.emit('remove_servo_loader', message[1]);
            } else if (message[0] == "growlight") {
                io.sockets.emit('remove_growlight_loader', message[1]);
            }
        } else if (topic == 'aquas/mail') {
            //MQTT mail handler
            var query = "SELECT id, email FROM administrator;",
                notif_query = "",
                jenis = "",
                subject = "",
                content = "",
                rec_email = []

            if (message.toString() == 'pemberitahuan_pakan') {
                jenis = 'pemberitahuan_pakan'
                subject = "pemberitahuan"
                content = 'Sisa pakan sebanyak ' + current_feed + "%, mohon segera lakukan isi ulang"
            } else if (message.toString() == 'peringatan_pakan') {
                jenis = 'peringatan_pakan'
                subject = "peringatan"
                content = 'Sisa pakan sebanyak ' + current_feed + '%, mohon segera lakukan isi ulang'
            } else if (message.toString() == 'peringatan_suhu') {
                jenis = 'peringatan_suhu'
                subject = "peringatan"
                content = 'Temperatur suhu saat ini  : ' + current_temp + ' celcius, mohon segera lakukan pemeriksaan'
            } else if (message.toString() == 'peringatan_ph') {
                jenis = 'peringatan_ph'
                subject = "peringatan"
                content = 'Derajat ph saat ini : ' + current_ph + ', mohon segera lakukan pemeriksaan'
            }

            query += "SELECT jenis FROM notifikasi WHERE jenis = '" + jenis + "';"
            query += "SELECT tanggal FROM notifikasi WHERE tanggal ='" + dateonly + "';"

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
                        from: process.env.EMAIL,
                        to: rec_email,
                        subject: jenis,
                        text: content
                    }

                    transporter.sendMail(mailOptions, function(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent!');
                        }
                    });
                }
            });
        }
    })

    io.on('connection', function(socket) {

        //Start Servo automation status (auto/manual) socket event
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
        });
        //End Servo automation status (auto/manual) socket event

        //Start Servo manual status socket event
        socket.on('servo_open', function() {
            io.sockets.emit('servo_open');
            client.publish(aquas_servo_topic, 'open');
            setTimeout(function() {
                io.sockets.emit('servo_close');
                client.publish(aquas_servo_topic, 'close');
            }, 3000)
        });
        //End Servo manual status socket event

        //Start pump manual event Socket
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
            client.publish(aquas_pump_topic, 'on');
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
            client.publish(aquas_pump_topic, 'off');
        });
        //End pump manual event Socket

        //Start light automation (auto/manual) socket event
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
            client.publish(aquas_growlight_topic, 'auto');
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
            client.publish(aquas_growlight_topic, 'manual');
            client.publish(aquas_growlight_manual_topic, 'off');
        });
        //End light automation (auto/manual) socket event

        //Start light manual (on/off) socket event
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
            client.publish(aquas_growlight_manual_topic, 'on');
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
            client.publish(aquas_growlight_manual_topic, 'off');
        });
        //End light manual (on/off) socket event

        //Feed schedule chnged socket event
        socket.on('feed_schedule_changed', function(data) {
            jadwal_pakan_pagi = data['input_pakan_pagi'] + " : 00";
            jadwal_pakan_siang = data['input_pakan_siang'] + " : 00";
            jadwal_pakan_sore = data['input_pakan_sore'] + " : 00";
        });



    });

    setInterval(function() {

        //get currrent server date and time
        var date = new Date(),
            seconds = date.getSeconds() < 10 ? '0' + String(date.getSeconds()) : date.getSeconds(),
            minutes = date.getMinutes() < 10 ? '0' + String(date.getMinutes()) : date.getMinutes(),
            hour = date.getHours() < 10 ? '0' + String(date.getHours()) : date.getHours(),
            time = hour + ':' + minutes + ':' + seconds,
            //Start feed automation process
            query = "SELECT waktu FROM  jadwal_pakan; "
        query += "SELECT status FROM status_aktuator WHERE jenis='servo_auto';"

        con.query(query, function(err, result) {
            if (err) throw err;

            if (result.length) {
                if (result[0][0]['waktu'] == time || result[0][1]['waktu'] == time || result[0][2]['waktu'] == time) {
                    if (result[1][0]['status'] == 'auto') {
                        client.publish(aquas_servo_topic, 'open');
                        setTimeout(function() {
                            client.publish(aquas_servo_topic, 'close');
                        }, 3000)
                    }
                }
            }
        });
        //End feed automation process

        client.publish(aquas_time_topic, String(hour)); //publish the current time to arduino
    }, 1000);





}