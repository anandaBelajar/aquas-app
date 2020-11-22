var mqtt = require('mqtt')
    //var client = mqtt.connect('mqtt://mqtt.eclipse.org:1883')
var client = mqtt.connect('mqtt://192.168.1.15:5000')

var topic = [
        'aquas/feed',
        'aquas/light',
        'aquas/ph',
        'aquas/temp',
        'aquas/pump',
        'aquas/growlight',
        'aquas/debug',
        'aquas/mail',
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