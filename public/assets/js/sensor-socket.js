/*
    Frontend Websocket
*/

var socket = io.connect("http://localhost:3000"); //Make connection between frontend and backend websocket

//Query DOM
var aquas_light_chart = $('#aquas_light_chart'),
    aquas_light_current_value = $('#aquas_light_current_value'),
    aquas_light_current_time = $('#aquas_light_current_time'),
    aquas_auto_light_toggle = $('#aquas_auto_light_toggle'),
    aquas_auto_light_toggle_container = $('.aquas_auto_light_toggle_container'),
    aquas_manual_light_toggle = $('#aquas_manual_light_toggle'),
    aquas_manual_light_toggle_container = $('.aquas_manual_light_toggle_container'),
    aquas_light_data_table = $('#aquas_light_data_table'),
    aquas_feed_current_value = $('#aquas_feed_current_value'),
    aquas_feed_current_time = $('#aquas_feed_current_time'),
    aquas_auto_feed_toggle = $('#aquas_auto_feed_toggle'),
    aquas_auto_feed_toggle_container = $('.aquas_auto_feed_toggle_container'),
    aquas_manual_feed_toggle = $('#aquas_manual_feed_toggle'),
    aquas_manual_feed_toggle_container = $('.aquas_manual_feed_toggle_container'),
    aquas_temp_chart = $('#aquas_temp_chart'),
    aquas_temp_current_value = $('#aquas_temp_current_value'),
    aquas_temp_current_time = $('#aquas_temp_current_time'),
    aquas_temp_data_table = $('#aquas_temp_data_table'),
    aquas_ph_chart = $('#aquas_ph_chart'),
    aquas_ph_current_value = $('#aquas_ph_current_value'),
    aquas_ph_current_time = $('#aquas_ph_current_time'),
    aquas_ph_data_table = $('#aquas_ph_data_table'),
    aquas_feed_bar = $('#aquas_feed_bar'),
    aquas_manual_pump_toggle_container = $('.aquas_manual_pump_toggle_container'),
    aquas_manual_pump_toggle = $('#aquas_manual_pump_toggle'),
    waktu_pakan_pagi = $('#waktu_pakan_pagi'),
    waktu_pakan_siang = $('#waktu_pakan_siang'),
    waktu_pakan_sore = $('#waktu_pakan_sore'),
    admins_data_table = $('#admins_data_table'),
    btn_submit_feed_scheduled = $('#btn_submit_feed_scheduled')

var pakan_pagi_options = {
        //hh:mm 24 hour format only, defaults to current time
        twentyFour: true, //Display 24 hour format, defaults to false
        close: 'wickedpicker__close', //The close class selector to use, for custom CSS
        title: 'Waktu Pakan Pagi', //The Wickedpicker's title,
        showSeconds: false, //Whether or not to show seconds,
    },
    pakan_siang_options = {
        //hh:mm 24 hour format only, defaults to current time
        twentyFour: true, //Display 24 hour format, defaults to false
        close: 'wickedpicker__close', //The close class selector to use, for custom CSS
        title: 'Waktu Pakan Siang', //The Wickedpicker's title,
        showSeconds: false, //Whether or not to show seconds,
    },
    pakan_sore_options = {
        //hh:mm 24 hour format only, defaults to current time
        twentyFour: true, //Display 24 hour format, defaults to false
        close: 'wickedpicker__close', //The close class selector to use, for custom CSS
        title: 'Waktu Pakan Sore', //The Wickedpicker's title,
        showSeconds: false, //Whether or not to show seconds,
    }

waktu_pakan_pagi.wickedpicker({
    now: waktu_pakan_pagi.data('waktu'),
    twentyFour: true, //Display 24 hour format, defaults to false
    title: 'Waktu Pakan Pagi', //The Wickedpicker's title,
    showSeconds: false, //Whether or not to show seconds,
});
waktu_pakan_siang.wickedpicker({
    now: waktu_pakan_siang.data('waktu'),
    twentyFour: true, //Display 24 hour format, defaults to false
    title: 'Waktu Pakan Siang', //The Wickedpicker's title,
    showSeconds: false, //Whether or not to show seconds,
});
waktu_pakan_sore.wickedpicker({
    now: waktu_pakan_sore.data('waktu'),
    twentyFour: true, //Display 24 hour format, defaults to false
    title: 'Waktu Pakan Sore', //The Wickedpicker's title,
    showSeconds: false, //Whether or not to show seconds,
});


//Start feed console
aquas_auto_feed_toggle.change(function() {
    if (this.checked) {
        socket.emit('servo_auto');
    } else {
        socket.emit('servo_manual');
    }
});

aquas_manual_feed_toggle.change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
        socket.emit('servo_open');
    } else {
        socket.emit('servo_close');
    }
});

//End feed console

//Start pump console
aquas_manual_pump_toggle.change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
        socket.emit('pump_on');
    } else {
        socket.emit('pump_off');
    }
});
//End pump console

//Start light console
aquas_auto_light_toggle.change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
        socket.emit('grow_light_auto');
    } else {
        socket.emit('grow_light_manual');
    }
});

aquas_manual_light_toggle.change(function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
        //aquas_manual_light_toggle_container.find('label').text('On')
        socket.emit('grow_light_on');
    } else {
        //aquas_manual_light_toggle_container.find('label').text('Off')
        socket.emit('grow_light_off');
    }
});

//End light console



//Start aquas feed bar
socket.on('aquas_feed_msg_arrive', function(msg) {
    //get the sensor and time value from backend websocket
    aquas_feed_bar.css({ "width": msg[0] + "%" }).text(msg[0] + "%").attr("aria-valuenow", msg[0]);

});

//End aquas feed bar
if (typeof aquas_light_chart[0] !== 'undefined') {
    var old_light_value = []; //['1000', '1101', '1130', '1190', '1200']; //emtpy array to hold chart data
    var old_light_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

    var light_ctx = aquas_light_chart[0].getContext('2d'); //get the chart holder from canvas tag in html
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
        aquas_light_current_value.text(msg[0]); //display current sensor value to inner html
        //aquas_light_current_time.innerHTML = msg[1]; //display current time to inner html
        light_chart_counter = light_chart_counter + 1; //add counter every receive the new sensor value
        if (light_chart_counter > 10) {
            //shift hide the first value if 10 data already exist in the chart
            light_chart_remove_value();
        }
    });
}

aquas_light_data_table.DataTable({
    ordering: false
})

aquas_temp_data_table.DataTable({
    ordering: false
})

aquas_ph_data_table.DataTable({
    ordering: false
})

admins_data_table.DataTable()



//Start temp chart
if (typeof aquas_temp_chart[0] !== 'undefined') {


    var old_temp_value = []; //['56', '55', '57', '57', '55']; //emtpy array to hold chart data
    var old_temp_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label



    var temp_ctx = aquas_temp_chart[0].getContext('2d'); //get the chart holder from canvas tag in html
    var temp_chart = new Chart(temp_ctx, { //make the chart
        type: 'line', //chart type
        responsive: true,
        data: {
            labels: old_temp_label, //labels
            datasets: [{
                label: 'Suhu dalam celcius', //dataset 1 legenda
                data: old_temp_value,
                backgroundColor: ['rgba(110, 193, 248, 0.5)'], //chart bacground color
                borderColor: [
                    'rgb(48, 129, 238)' //chart borde color
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

        aquas_temp_current_value.text(msg[0]); //display current sensor value to inner html
        //aquas_temp_current_time.innerHTML = msg[1]; //display current time to inner html

        temp_chart_counter = temp_chart_counter + 1;
        if (temp_chart_counter > 10) {
            //shift hide the first value if 10 data already exist in the chart
            temp_chart_remove_value();
        }

    });
}

//End temp chart


//Start ph chart
if (typeof aquas_ph_chart[0] !== 'undefined') {
    var old_ph_value = []; //['56', '55', '57', '57', '55']; //emtpy array to hold chart data
    var old_ph_label = []; //['08:01:01', '08:01:02', '08:01:03', '08:01:04', '08:01:05']; //empty array to hold chart label

    var ph_ctx = aquas_ph_chart[0].getContext('2d'); //get the chart holder from canvas tag in html
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

        aquas_ph_current_value.text(msg[0]); //display current sensor value to inner html
        //aquas_ph_current_time.innerHTML = msg[1]; //display current time to inner html

        ph_chart_counter = ph_chart_counter + 1;
        if (ph_chart_counter > 10) {
            //shift hide the first value if 10 data already exist in the chart
            ph_chart_remove_value();
        }

    });
}
//End ph chart

$(function() {
    //Start feed toggle event
    socket.on('servo_auto', function() {
        aquas_auto_feed_toggle.prop('checked', true);
        aquas_auto_feed_toggle_container.find('label').text('Auto')
        aquas_manual_feed_toggle_container.slideUp();
    })

    socket.on('servo_manual', function() {
        aquas_auto_feed_toggle.prop('checked', false);
        aquas_auto_feed_toggle_container.find('label').text('Manual')
        aquas_manual_feed_toggle_container.slideDown();
    })

    socket.on('servo_open', function() {
        aquas_manual_feed_toggle.prop('checked', true)
        aquas_manual_feed_toggle_container.find('label').text('Buka')
    })


    socket.on('servo_close', function() {
        aquas_manual_feed_toggle.prop('checked', false)
        aquas_manual_feed_toggle_container.find('label').text('Tutup')
    })


    // End feed toggle event

    //Start pump pump toggle event

    socket.on('pump_on', function() {
        aquas_manual_pump_toggle.prop('checked', true)
        aquas_manual_pump_toggle_container.find('label').text('On')
    })

    socket.on('pump_off', function() {
        aquas_manual_pump_toggle.prop('checked', false)
        aquas_manual_pump_toggle_container.find('label').text('Off')
    })

    //End pump toggle event

    //Start light toggle event

    socket.on('grow_light_auto', function() {
        aquas_auto_light_toggle.prop('checked', true)
        aquas_manual_light_toggle.prop('checked', false)
        aquas_manual_light_toggle_container.slideUp();
        aquas_auto_light_toggle_container.find('label').text('Auto')
    })

    socket.on('grow_light_manual', function() {
        aquas_auto_light_toggle.prop('checked', false)
        aquas_manual_light_toggle_container.slideDown();
        aquas_auto_light_toggle_container.find('label').text('Manual')
    })

    socket.on('grow_light_on', function() {
        aquas_manual_light_toggle.prop('checked', true)
        aquas_manual_light_toggle_container.find('label').text('On')
    })

    socket.on('grow_light_off', function() {
        aquas_manual_light_toggle.prop('checked', false)
        aquas_manual_light_toggle_container.find('label').text('Off')
    })

    //End light toggle event

    btn_submit_feed_scheduled.on('click', function() {

        socket.emit('feed_schedule_changed', {
            input_pakan_pagi: waktu_pakan_pagi.val(),
            input_pakan_siang: waktu_pakan_siang.val(),
            input_pakan_sore: waktu_pakan_sore.val(),
        });
    })


});