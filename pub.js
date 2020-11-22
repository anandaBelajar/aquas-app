var mqtt = require('mqtt') //require mqtt packgae
let client = mqtt.connect('mqtt://192.168.1.15:5000'); //make connection to mosca local mqtt broker

var topic = 'aquas/mail';

client.on('connect', function() {
    client.subscribe(topic, function(err) {
        if (!err) {
            client.publish(topic, 'pemberitahuan_pakan'); //publish the messsage
            //client.publish(topic, 'peringatan'); //publish the messsage
        }
        client.end(); //close the client
    })
})