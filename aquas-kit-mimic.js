let mqtt = require('mqtt'); //require mqtt package
require('dotenv').config({ path: __dirname + '/.env' })
    //let client = mqtt.connect('mqtt://mqtt.eclipse.org:1883'); //setup the broker

let client = mqtt.connect(process.env.VPS_MQTT_BROKER, {
    username: process.env.VPS_MQTT_USER,
    password: process.env.VPS_MQTT_PASS
}); //connect to local broker

var topic = [
        'aquas/pump',
        'aquas/growlight',
        'aquas/growlight_manual',
        'aquas/servo',
        'aquas/servo_auto',
        'aquas/servo_manual',
        'aquas/time'
    ] //set the topic

client.on('connect', function() {
    console.log('concted to a broker...'); //when connection to boker success display this
    topic.forEach(function(value, index) {
        client.subscribe(value, function(err) {

            console.log('subscribed to topic : ' + value); //display the subscribed topic of the mqtt broker


        })

    });

})

client.on('message', function(topic, message) {
    // message is Buffer
    //console.log('topic : ' + topic + ' message : ' + message.toString()) //show th message
    //client.end() //client.end digunakan untuk menghentikan listening pada suatu broker
    if (topic == "aquas/pump") {
        console.log(topic + ' : ' + message.toString())
        if (message.toString() == "on") {
            client.publish('aquas/remove-loader', "pump/on")
        } else if (message.toString() == "off") {
            client.publish('aquas/remove-loader', "pump/off")
        }
    } else if (topic == "aquas/growlight_manual") {
        console.log(topic + ' : ' + message.toString())
        if (message.toString() == "on") {
            client.publish('aquas/remove-loader', "growlight/on")
        } else if (message.toString() == "off") {
            client.publish('aquas/remove-loader', "growlight/off")
        }
    } else if (topic == "aquas/servo") {
        console.log(topic + ' : ' + message.toString())
        if (message.toString() == "open") {
            client.publish('aquas/remove-loader', "servo/buka")
        } else if (message.toString() == "close") {
            client.publish('aquas/remove-loader', "servo/tutup")
        }
    } else if (topic == "aquas/growlight") {
        console.log(topic + ' : ' + message.toString())
    }
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


setInterval(function() {
    var feed_value = getRandomInt(1, 23).toString()
    var light_value = getRandomInt(6000, 7000).toString()
    var temp_value = getRandomInt(26, 28).toString()
    var ph_value = getRandomInt(6, 8).toString()

    client.publish('aquas/feed', feed_value)
    client.publish('aquas/light', light_value)
    client.publish('aquas/temp', temp_value)
    client.publish('aquas/ph', ph_value)
}, 1000);