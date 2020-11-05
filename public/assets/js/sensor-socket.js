/*
    Frontend Websocket
*/

var socket = io.connect("http://localhost:3000"); //Make connection between frontend and backend websocket

//Query DOM
var aquas_light_current_value = document.getElementById('aquas_light_current_value');
var aquas_light_current_time = document.getElementById('aquas_light_current_time');
var aquas_feed_current_value = document.getElementById('aquas_feed_current_value');
var aquas_feed_current_time = document.getElementById('aquas_feed_current_time');
var aquas_temp_current_value = document.getElementById('aquas_temp_current_value');
var aquas_temp_current_time = document.getElementById('aquas_temp_current_time');
var aquas_ph_current_value = document.getElementById('aquas_ph_current_value');
var aquas_ph_current_time = document.getElementById('aquas_ph_current_time');

var old_light_value = []; //['1000', '1101', '1130', '1190', '1200']; //emtpy array to hold chart data
var old_light_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

var light_ctx = document.getElementById('aquas_light_chart').getContext('2d'); //get the chart holder from canvas tag in html
console.log(light_ctx)
console.log('............')
var light_chart = new Chart(light_ctx, { //make the chart
    type: 'line', //chart type
    responsive: true,
    data: {
        labels: old_light_label, //chart labels
        datasets: [{
            label: 'Intensitas cahaya dalam lux', //dataset 1 legenda
            data: old_light_value,
            backgroundColor: ['rgba(255, 255, 77, 0.5)'], //chart background color
            borderColor: [
                'rgb(255, 242, 0)' //chart border color
            ],
            borderWidth: 1
        }, ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});



function light_chart_add_value(data) {
    //add sensor value to the light chart
    light_chart.data.labels.push(data[1]); //pushing current time to the light chart
    light_chart.data.datasets[0].data.push(data[0]); //pushing current sensor value to light chart
    light_chart.update(); //update the chart
}

function light_chart_remove_value() {
    //remove sensor value from the light chart
    light_chart.data.labels.shift(); //shifting hide first oldest value of time from the chart
    light_chart.data.datasets[0].data.shift(); //shifting first oldest value of sensor value from the chart
    light_chart.update(); //update the chart
};

var light_chart_counter = 0; //chart dataset update counter

socket.on('aquas_light_msg_arrive', function(msg) {
    //get the sensor and time value from backend websocket
    light_chart_add_value(msg); //add value to light chart
    //aquas_light_current_value.innerHTML = msg[0]; //display current sensor value to inner html
    //aquas_light_current_time.innerHTML = msg[1]; //display current time to inner html
    light_chart_counter = light_chart_counter + 1; //add counter every receive the new sensor value
    if (light_chart_counter > 10) {
        //shift hide the first value if 10 data already exist in the chart
        light_chart_remove_value();
    }
});


// var old_feed_value = []; //['56', '55', '57', '57', '55']; //emtpy array to hold chart data
// var old_feed_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label


// var feed_ctx = document.getElementById('aquas_feed_chart').getContext('2d'); //get the chart holder from canvas tag in html
// var feed_chart = new Chart(feed_ctx, { //make the chart
//     type: 'line', //chart type
//     responsive: true,
//     data: {
//         labels: old_feed_label, //labels
//         datasets: [{
//             label: 'Soil Moisture in percentage', //dataset 1 legenda
//             data: old_feed_value,
//             backgroundColor: ['rgba(255, 160, 122, 0.5)'], //chart bacground color
//             borderColor: [
//                 'rgb(126, 46, 31)' //chart borde color
//             ],
//             borderWidth: 1
//         }, ]
//     },
//     options: {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero: true
//                 }
//             }]
//         }
//     }
// });



// function feed_chart_add_value(data) {
//     //add sensor value to the mositure chart
//     feed_chart.data.labels.push(data[1]); //pushing current time to chart
//     feed_chart.data.datasets[0].data.push(data[0]); //pushing current sensor value to chart
//     feed_chart.update(); //update the chart
// }

// function feed_chart_remove_value() {
//     feed_chart.data.labels.shift(); //shifting hide first oldest value of time from the chart
//     feed_chart.data.datasets[0].data.shift(); //shifting first oldest value of sensor value from the chart
//     feed_chart.update(); //update the chart
// };

// var feed_chart_counter = 0; //chart dataset update counter

// socket.on('aquas_feed_msg_arrive', function(msg) {
//     //get the sensor and time value from backend websocket
//     feed_chart_add_value(msg); //add value to chart

//     aquas_feed_current_value.innerHTML = msg[0]; //display current sensor value to inner html
//     aquas_feed_current_time.innerHTML = msg[1]; //display current time to inner html

//     feed_chart_counter = feed_chart_counter + 1;
//     if (feed_chart_counter > 10) {
//         //shift hide the first value if 10 data already exist in the chart
//         feed_chart_remove_value();
//     }

// });

var pumpState = 0; //pump state

function turnPump() {
    //function to turn on/off pump

    if (pumpState == 0) {
        pumpState = 1;
        socket.emit('pumpOn'); //emit pumpOn event
        document.getElementById('pump_publish').innerText = 'Turn Off Pump'; //change the button text
    } else if (pumpState == 1) {
        pumpState = 0;
        document.getElementById('pump_publish').innerText = 'Turn On Pump'; //change the button text
        socket.emit('pumpOff'); //emit pumpOff event
    }


    return true;
}

//Start temp chart

var old_temp_value = []; //['56', '55', '57', '57', '55']; //emtpy array to hold chart data
var old_temp_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

var temp_ctx = document.getElementById('aquas_temp_chart').getContext('2d'); //get the chart holder from canvas tag in html
var temp_chart = new Chart(temp_ctx, { //make the chart
    type: 'line', //chart type
    responsive: true,
    data: {
        labels: old_temp_label, //labels
        datasets: [{
            label: 'Suhu dalam celcius', //dataset 1 legenda
            data: old_temp_value,
            backgroundColor: ['rgba(255, 160, 122, 0.5)'], //chart bacground color
            borderColor: [
                'rgb(126, 46, 31)' //chart borde color
            ],
            borderWidth: 1
        }, ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});



function temp_chart_add_value(data) {
    //add sensor value to the mositure chart
    temp_chart.data.labels.push(data[1]); //pushing current time to chart
    temp_chart.data.datasets[0].data.push(data[0]); //pushing current sensor value to chart
    temp_chart.update(); //update the chart
}

function temp_chart_remove_value() {
    temp_chart.data.labels.shift(); //shifting hide first oldest value of time from the chart
    temp_chart.data.datasets[0].data.shift(); //shifting first oldest value of sensor value from the chart
    temp_chart.update(); //update the chart
};

var temp_chart_counter = 0; //chart dataset update counter

socket.on('aquas_temp_msg_arrive', function(msg) {
    //get the sensor and time value from backend websocket

    temp_chart_add_value(msg); //add value to chart

    //aquas_temp_current_value.innerHTML = msg[0]; //display current sensor value to inner html
    //aquas_temp_current_time.innerHTML = msg[1]; //display current time to inner html

    temp_chart_counter = temp_chart_counter + 1;
    if (temp_chart_counter > 10) {
        //shift hide the first value if 10 data already exist in the chart
        temp_chart_remove_value();
    }

});

//End temp chart

//Start ph chart

var old_ph_value = []; //['56', '55', '57', '57', '55']; //emtpy array to hold chart data
var old_ph_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

var ph_ctx = document.getElementById('aquas_ph_chart').getContext('2d'); //get the chart holder from canvas tag in html
var ph_chart = new Chart(ph_ctx, { //make the chart
    type: 'line', //chart type
    responsive: true,
    data: {
        labels: old_ph_label, //labels
        datasets: [{
            label: 'Derajat pH', //dataset 1 legenda
            data: old_ph_value,
            backgroundColor: ['rgba(255, 160, 122, 0.5)'], //chart bacground color
            borderColor: [
                'rgb(126, 46, 31)' //chart borde color
            ],
            borderWidth: 1
        }, ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});



function ph_chart_add_value(data) {
    //add sensor value to the mositure chart
    ph_chart.data.labels.push(data[1]); //pushing current time to chart
    ph_chart.data.datasets[0].data.push(data[0]); //pushing current sensor value to chart
    ph_chart.update(); //update the chart
}

function ph_chart_remove_value() {
    ph_chart.data.labels.shift(); //shifting hide first oldest value of time from the chart
    ph_chart.data.datasets[0].data.shift(); //shifting first oldest value of sensor value from the chart
    ph_chart.update(); //update the chart
};

var ph_chart_counter = 0; //chart dataset update counter

socket.on('aquas_ph_msg_arrive', function(msg) {
    //get the sensor and time value from backend websocket

    ph_chart_add_value(msg); //add value to chart

    //aquas_ph_current_value.innerHTML = msg[0]; //display current sensor value to inner html
    //aquas_ph_current_time.innerHTML = msg[1]; //display current time to inner html

    ph_chart_counter = ph_chart_counter + 1;
    if (ph_chart_counter > 10) {
        //shift hide the first value if 10 data already exist in the chart
        ph_chart_remove_value();
    }

});

//End ph chart