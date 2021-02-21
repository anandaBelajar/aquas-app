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
        aquas_servo_topic = 'aquas/servo',
        pemberitahuan_pakan_timeout,
        peringatan_pakan_timeout,
        peringatan_suhu_timeout,
        peringatan_ph_timeout,
        peringatan_cahaya_timeout,
        feeder_timeout,
        //global current sensor value
        ultrasonic_input,
        current_feed = "",
        current_feed_gram = "",
        current_temp = "",
        current_ph = "",
        current_light = ""

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
                        growlight_auto_status = item['status'];
                    } else if (item['jenis'] == 'grow_light_manual' && growlight_auto_status == 'manual') {
                        client.publish(aquas_growlight_topic, item['status'])
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
            ultrasonic_input = message.toString()
            raw = (20 - ultrasonic_input) / 20,
                convertion = ultrasonic_input > 20 ? 0 : raw
                //formula current_feed = Math.trunc((max height - feed / max height * 100)
            current_feed = Math.trunc(convertion * 100)
                //formula current_feed = Math.trunc((max height - feed / max height * 450)
            current_feed_gram = Math.trunc(convertion * 450)
            var feed = parseInt(message.toString()) < 100 ? [current_feed, current_feed_gram, time] : [100, 450, time];
            io.sockets.emit('aquas_feed_msg_arrive', feed);
        } else if (topic == 'aquas/light') {
            //MQTT light value handler
            current_light = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_cahaya` (`data`, `waktu`) VALUES (";
                sql += "'" + current_light + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;
                });
            }
            var light = [current_light, time];
            io.sockets.emit('aquas_light_msg_arrive', light);

        } else if (topic == 'aquas/temp') {
            //MQTT temprature value handler
            current_temp = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_suhu` (`data`, `waktu`) VALUES (";
                sql += "'" + mcurrent_temp + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var temp = [current_temp, time];
            io.sockets.emit('aquas_temp_msg_arrive', temp);
        } else if (topic == 'aquas/ph') {
            //MQTT ph value handler
            current_ph = message.toString()
            if (minutes % 60 == 0 && seconds == 0) {
                var sql = "INSERT INTO `data_ph` (`data`, `waktu`) VALUES (";
                sql += "'" + current_ph + "',";
                sql += "'" + dbDateTime + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var ph = [current_ph, time];
            io.sockets.emit('aquas_ph_msg_arrive', ph);
        } else if (topic == "aquas/remove-loader") {
            //MQTT actuator loading animation handler
            var message = message.toString().split("/")
            if (message[0] == "pump") {
                io.sockets.emit('remove_pump_loader', message[1]);
            } else if (message[0] == "servo") {
                if (message[1] == 'Tutup') {
                    io.sockets.emit('servo_close');
                }
                io.sockets.emit('remove_servo_loader', message[1]);
            } else if (message[0] == "growlight") {
                io.sockets.emit('remove_growlight_loader', message[1]);
            }
        } else if (topic == 'aquas/mail') {
            //MQTT mail handler
            var jenis = "",
                subject = "",
                content = ""

            if (message.toString() == 'pemberitahuan_pakan') {
                if (!pemberitahuan_pakan_timeout) {
                    pemberitahuan_pakan_timeout = setTimeout(function() {
                        if (ultrasonic_input > 11 && ultrasonic_input <= 17) {
                            jenis = 'pemberitahuan_pakan'
                            subject = "pemberitahuan"
                            content = 'Persediaan pakan sebanyak ' + current_feed + '% dengan kuantitas ' + current_feed_gram + ', mohon segera lakukan isi ulang'
                            send_email(jenis, subject, dateonly, time, content);
                        }
                        pemberitahuan_pakan_timeout = null
                    }, 10000);
                }
            } else if (message.toString() == 'peringatan_pakan') {
                if (!peringatan_pakan_timeout) {
                    peringatan_pakan_timeout = setTimeout(function() {
                        if (ultrasonic_input > 17) {
                            jenis = 'peringatan_pakan'
                            subject = "peringatan"
                            content = 'Persediaan pakan sebanyak ' + current_feed + '% dengan kuantitas ' + current_feed_gram + ', mohon segera lakukan isi ulang'
                            send_email(jenis, subject, dateonly, time, content);
                        }
                        peringatan_pakan_timeout = null
                    }, 10000)
                }
            } else if (message.toString() == 'peringatan_suhu') {
                if (!peringatan_suhu_timeout) {
                    peringatan_suhu_timeout = setTimeout(function() {
                        if (current_temp < 18 || current_temp > 30) {
                            jenis = 'peringatan_suhu'
                            subject = "peringatan"
                            content = 'Temperatur suhu saat ini  : ' + current_temp + ' celcius, mohon segera lakukan pemeriksaan'
                            send_email(jenis, subject, dateonly, time, content);
                        }
                        peringatan_suhu_timeout = null
                    }, 5000)
                }

            } else if (message.toString() == 'peringatan_ph') {
                if (!peringatan_ph_timeout) {
                    peringatan_ph_timeout = setTimeout(function() {
                        if (current_ph < 5.5 || current_ph > 7.5) {
                            jenis = 'peringatan_ph'
                            subject = "peringatan"
                            content = 'Derajat ph saat ini : ' + current_ph + ', mohon segera lakukan pemeriksaan'
                            send_email(jenis, subject, dateonly, time, content);
                        }
                        peringatan_ph_timeout = null
                    }, 5000)
                }
            } else if (message.toString() == 'peringatan_cahaya') {
                if (!peringatan_cahaya_timeout) {
                    peringatan_cahaya_timeout = setTimeout(function() {
                        if (current_light > 19384) {
                            jenis = 'peringatan_cahaya'
                            subject = "peringatan"
                            content = 'Intensitas cahaya saat ini : ' + current_light + ' lux, mohon segera lakukan pemeriksaan'
                            send_email(jenis, subject, dateonly, time, content);
                        }
                        peringatan_cahaya_timeout = null
                    }, 5000)
                }
            }
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
                client.publish(aquas_servo_topic, 'close');
            }, feeder_timeout)
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
            client.publish(aquas_growlight_topic, 'off');
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
            client.publish(aquas_growlight_topic, 'on');
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
            client.publish(aquas_growlight_topic, 'off');
        });
        //End light manual (on/off) socket event

        //Feed schedule chnged socket event
        socket.on('feed_schedule_changed', function(data) {
            jadwal_pakan_pagi = data['input_pakan_pagi'] + " : 00";
            jadwal_pakan_siang = data['input_pakan_siang'] + " : 00";
            jadwal_pakan_sore = data['input_pakan_sore'] + " : 00";
        });

        socket.on('feeder_timeout_changed', function(data) {
            feeder_timeout = data['feeder_timeout'] * 1000;
        });
    });


    /**
     * Sending email funtion
     * 
     * @param {*} jenis 
     * @param {*} subject 
     * @param {*} dateonly 
     * @param {*} time 
     * @param {*} content 
     */
    function send_email(jenis, subject, dateonly, time, content) {
        var query = "SELECT id, email FROM administrator;",
            notif_query = "",
            rec_email = []

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

    setInterval(function() {

        //get currrent server date and time
        var date = new Date(),
            seconds = date.getSeconds() < 10 ? '0' + String(date.getSeconds()) : date.getSeconds(),
            minutes = date.getMinutes() < 10 ? '0' + String(date.getMinutes()) : date.getMinutes(),
            hour = date.getHours() < 10 ? '0' + String(date.getHours()) : date.getHours(),
            time = hour + ':' + minutes + ':' + seconds,
            //Start feed automation process
            query = "SELECT waktu FROM  jadwal_aktuator WHERE aktuator ='servo';"
        query += "SELECT status FROM status_aktuator WHERE jenis='servo_auto';"
        query += "SELECT status FROM status_aktuator WHERE jenis='grow_light_auto';"
        query += "SELECT waktu FROM  jadwal_aktuator WHERE aktuator ='growlight';"
        query += "SELECT `limit` FROM limit_aktuator WHERE jenis='limit_cahaya_growlight';"

        con.query(query, function(err, result) {
            if (err) throw err;

            if (result.length) {
                if (result[0][0]['waktu'] == time || result[0][1]['waktu'] == time || result[0][2]['waktu'] == time) {
                    if (result[1][0]['status'] == 'auto') {
                        client.publish(aquas_servo_topic, 'open');
                        setTimeout(function() {
                            client.publish(aquas_servo_topic, 'close');
                        }, feeder_timeout)
                    }
                }
                if (result[2][0]['status'] == 'auto') {
                    if (current_light < result[4][0]['limit'] && time >= result[3][0]['waktu'] && time <= result[3][1]['waktu']) {
                        client.publish(aquas_growlight_topic, 'on');
                    } else {
                        client.publish(aquas_growlight_topic, 'off');
                    }
                }
            }
        });
        //End feed automation process


    }, 1000);

}