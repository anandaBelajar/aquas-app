/*
Backend Websocket
*/

var socket = require('socket.io'); //require socket.io package
let mqtt = require('mqtt'); //require mqtt package

module.exports = function(server, con) { //exports the function

    let client = mqtt.connect(process.env.MQTT_BROKER); //connect to online broker
    //let client = mqtt.connect(process.env.LOCAL_BROKER); //connect to local broker

    var io = socket(server); //pass the server as socket parameter

    var topic = [
        'aquas/feed',
        'aquas/light',
        'aquas/temp',
        'aquas/ph',
    ]; //mqtt topic

    var pubTopic = 'garden/monitor/system/pump';

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
        var time = hour + ' : ' + minutes + ' : ' + seconds; //current time to display on front end
        var dbDateTime = year + "-" + month + "-" + day + "- " + hour + ":" + minutes + ":" + seconds; //date time to save in database

        if (topic == 'aquas/feed') {
            var feed = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_feed_msg_arrive', feed); //send sensor value and current time to frontend websocket
        } else
        if (topic == 'aquas/light') {
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `data_cahaya` (`data`) VALUES (";
                sql += "'" + message.toString() + "')";
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
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `data_suhu` (`data`) VALUES (";
                sql += "'" + message.toString() + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var temp = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_temp_msg_arrive', temp);
        } else if (topic == 'aquas/ph') {
            if (minutes % 60 == 0 && seconds == 0) {
                //save the sensor value to database every 60 minutes
                var sql = "INSERT INTO `data_ph` (`data`) VALUES (";
                sql += "'" + message.toString() + "')";
                con.query(sql, function(err, result) {
                    if (err) throw err;

                });
            }
            var ph = [message.toString(), time]; //save sensor value from mqtt message and current time 
            io.sockets.emit('aquas_ph_msg_arrive', ph);
        }
    })

    io.on('connection', function(socket) {
        socket.on('pumpOn', function() {
            //when pumpOn event emitted publih the message
            client.publish(pubTopic, 'on'); //publish the messsage
        });

        socket.on('pumpOff', function() {
            //when pumpOff event emitted publih the message
            client.publish(pubTopic, 'off'); //publish the messsage
        });
    });




}