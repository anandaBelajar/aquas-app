let mqtt = require('mqtt'); //require mqtt package
let client = mqtt.connect('mqtt://mqtt.eclipse.org:1883'); //setup the broker

var topic = [
        //'aquas/ultrasonic',
        //'aquas/light',
        //'aquas/ph',
        //'aquas/temp',
        'aquas/pump',
        'aquas/growlight',
        'aquas/debug',
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
    console.log('topic : ' + topic + ' message : ' + message.toString()) //show th message
        //client.end() //client.end digunakan untuk menghentikan listening pada suatu broker
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


setInterval(function() {
    var feed_value = getRandomInt(1, 100).toString()
    var light_value = getRandomInt(1, 2000).toString()
    var temp_value = getRandomInt(1, 10).toString()
    var ph_value = getRandomInt(1, 14).toString()

    client.publish('aquas/feed', feed_value)
    client.publish('aquas/light', light_value)
    client.publish('aquas/temp', temp_value)
    client.publish('aquas/ph', ph_value)
}, 1000);