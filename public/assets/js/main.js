var socket = io.connect("http://localhost:3000"), //connect to server websocket
    //DOM Query
    aquas_light_chart = $('#aquas_light_chart'),
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
    aquas_feed_qty = $('#aquas_feed_qty'),
    aquas_manual_pump_toggle_container = $('.aquas_manual_pump_toggle_container'),
    aquas_manual_pump_toggle = $('#aquas_manual_pump_toggle'),
    waktu_pakan_pagi = $('#waktu_pakan_pagi'),
    waktu_pakan_siang = $('#waktu_pakan_siang'),
    waktu_pakan_sore = $('#waktu_pakan_sore'),
    waktu_pencahayaan_mulai = $('#waktu_pencahayaan_mulai'),
    waktu_pencahayaan_selesai = $('#waktu_pencahayaan_selesai'),
    admins_data_table = $('#admins_data_table'),
    btn_submit_feed_scheduled = $('#btn_submit_feed_scheduled'),
    btn_submit_feeder_timeout = $('#btn_submit_feeder_timeout'),
    feeder_timeout = $("#feeder_timeout"),
    growlight_light_limit = $("#growlight_light_limit")


//feed schedule wicked picker configuration
waktu_pakan_pagi.wickedpicker({
    now: waktu_pakan_pagi.data('waktu'),
    twentyFour: true,
    title: 'Waktu Pakan Pagi',
    showSeconds: false,
});
waktu_pakan_siang.wickedpicker({
    now: waktu_pakan_siang.data('waktu'),
    twentyFour: true,
    title: 'Waktu Pakan Siang',
    showSeconds: false,
});
waktu_pakan_sore.wickedpicker({
    now: waktu_pakan_sore.data('waktu'),
    twentyFour: true,
    title: 'Waktu Pakan Sore',
    showSeconds: false,
});

//feeder timeout field
feeder_timeout.TouchSpin();

//lighting schedule wickedpicker configuration
waktu_pencahayaan_mulai.wickedpicker({
    now: waktu_pencahayaan_mulai.data('waktu'),
    twentyFour: true,
    title: 'Waktu Pencahayaan Mulai',
    showSeconds: false,
});

waktu_pencahayaan_selesai.wickedpicker({
    now: waktu_pencahayaan_selesai.data('waktu'),
    twentyFour: true,
    title: 'Waktu Pencahayaan Selesai',
    showSeconds: false,
});

//growlight light limit field
growlight_light_limit.TouchSpin();

//Start servo toggle event emitter
aquas_auto_feed_toggle.change(function() {
    //servo toggle automation (auto/manual)
    if (this.checked) {
        socket.emit('servo_auto');
    } else {
        socket.emit('servo_manual');
    }
});

aquas_manual_feed_toggle.change(function() {
    //servo toggle manual status (open/close)
    if (this.checked) {
        socket.emit('servo_open');
    } else {
        socket.emit('servo_close');
    }
});

//End servo toggle evenet emitter

//Start pump toggle event emitter
aquas_manual_pump_toggle.change(function() {
    if (this.checked) {
        socket.emit('pump_on');
    } else {
        socket.emit('pump_off');
    }
});
//End pump console

//Start lighthing toggle event emitter
aquas_auto_light_toggle.change(function() {
    //lighting automation toggle (auto/manual)
    if (this.checked) {
        socket.emit('grow_light_auto');
    } else {
        socket.emit('grow_light_manual');
    }
});

aquas_manual_light_toggle.change(function() {
    //lighting toggle manual status (on/off)
    if (this.checked) {
        socket.emit('grow_light_on');
    } else {
        socket.emit('grow_light_off');
    }
});
//End lighting toggle event emitter

//Start data table
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
    //end data table

//Start aquas feed bar
socket.on('aquas_feed_msg_arrive', function(msg) {
    //get the sensor and time value from backend websocket
    aquas_feed_bar.css({ "width": msg[0] + "%" }).text(msg[0] + "%").attr("aria-valuenow", msg[0]);
    aquas_feed_qty.text('Kuantitas : ' + msg[1] + ' gram')
});
//End aquas feed bar

//Start  light chart
if (typeof aquas_light_chart[0] !== 'undefined') {

    //init the light chart
    var old_light_value = [],
        old_light_label = [],
        light_ctx = aquas_light_chart[0].getContext('2d'),
        light_chart = new Chart(light_ctx, {
            type: 'line',
            responsive: true,
            data: {
                labels: old_light_label,
                datasets: [{
                    label: 'Intensitas cahaya dalam lux',
                    data: old_light_value,
                    backgroundColor: ['rgba(255, 255, 77, 0.5)'],
                    borderColor: [
                        'rgb(255, 242, 0)'
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

    //add new data to light chart
    function light_chart_add_value(data) {
        light_chart.data.labels.push(data[1]);
        light_chart.data.datasets[0].data.push(data[0]);
        light_chart.update();
    }

    //remove the oldest 10th data
    function light_chart_remove_value() {
        light_chart.data.labels.shift();
        light_chart.data.datasets[0].data.shift();
        light_chart.update();
    };

    var light_chart_counter = 0; //chart dataset update counter

    //get light value from backend websocket
    socket.on('aquas_light_msg_arrive', function(msg) {
        light_chart_add_value(msg);
        aquas_light_current_value.text(msg[0]);
        light_chart_counter = light_chart_counter + 1;
        if (light_chart_counter > 10) {
            light_chart_remove_value();
        }
    });
}
//End light chart

//Start temp chart
if (typeof aquas_temp_chart[0] !== 'undefined') {

    //init the temp chart
    var old_temp_value = [],
        old_temp_label = [],
        temp_ctx = aquas_temp_chart[0].getContext('2d'),
        temp_chart = new Chart(temp_ctx, {
            type: 'line',
            responsive: true,
            data: {
                labels: old_temp_label,
                datasets: [{
                    label: 'Suhu dalam celcius',
                    data: old_temp_value,
                    backgroundColor: ['rgba(110, 193, 248, 0.5)'],
                    borderColor: [
                        'rgb(48, 129, 238)'
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

    //add new temp value to chart
    function temp_chart_add_value(data) {
        temp_chart.data.labels.push(data[1]);
        temp_chart.data.datasets[0].data.push(data[0]);
        temp_chart.update();
    }

    //remove temp 10th oldest value
    function temp_chart_remove_value() {
        temp_chart.data.labels.shift();
        temp_chart.data.datasets[0].data.shift();
        temp_chart.update();
    };

    var temp_chart_counter = 0;

    //get temp value from backend websocket
    socket.on('aquas_temp_msg_arrive', function(msg) {
        temp_chart_add_value(msg);

        aquas_temp_current_value.text(msg[0]);

        temp_chart_counter = temp_chart_counter + 1;
        if (temp_chart_counter > 10) {
            temp_chart_remove_value();
        }

    });
}

//End temp chart


//Start ph chart
if (typeof aquas_ph_chart[0] !== 'undefined') {

    //init ph chart
    var old_ph_value = [],
        old_ph_label = [],
        ph_ctx = aquas_ph_chart[0].getContext('2d'),
        ph_chart = new Chart(ph_ctx, {
            type: 'line',
            responsive: true,
            data: {
                labels: old_ph_label,
                datasets: [{
                    label: 'Derajat pH',
                    data: old_ph_value,
                    backgroundColor: ['rgba(255, 160, 122, 0.5)'],
                    borderColor: [
                        'rgb(126, 46, 31)'
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

    //add new data to ph chart
    function ph_chart_add_value(data) {
        ph_chart.data.labels.push(data[1]);
        ph_chart.data.datasets[0].data.push(data[0]);
        ph_chart.update();
    }

    //remove 10th oldest value from ph chart
    function ph_chart_remove_value() {
        ph_chart.data.labels.shift();
        ph_chart.data.datasets[0].data.shift();
        ph_chart.update();
    };

    var ph_chart_counter = 0;

    //get ph value from backend websocket
    socket.on('aquas_ph_msg_arrive', function(msg) {

        ph_chart_add_value(msg);

        aquas_ph_current_value.text(msg[0]);

        ph_chart_counter = ph_chart_counter + 1;
        if (ph_chart_counter > 10) {
            ph_chart_remove_value();
        }

    });
}
//End ph chart

$(function() {
    //Start servo toggle event listener
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
        aquas_manual_feed_toggle_container.find('label').text('')
        aquas_manual_feed_toggle_container.find('.loader-container').addClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    socket.on('servo_close', function() {
        aquas_manual_feed_toggle.prop('checked', false)
        aquas_manual_feed_toggle_container.find('label').text('')
        aquas_manual_feed_toggle_container.find('.loader-container').addClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    socket.on('remove_servo_loader', function(status) {
        aquas_manual_feed_toggle_container.find('label').text(status)
        aquas_manual_feed_toggle_container.find('.loader-container').removeClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    // End servo toggle event listener

    //Start pump toggle event listener
    socket.on('pump_on', function() {
        aquas_manual_pump_toggle.prop('checked', true)
        aquas_manual_pump_toggle_container.find('label').text('')
        aquas_manual_pump_toggle_container.find('.loader-container').addClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    socket.on('pump_off', function() {
        aquas_manual_pump_toggle.prop('checked', false)
        aquas_manual_pump_toggle_container.find('label').text('')
        aquas_manual_pump_toggle_container.find('.loader-container').addClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    socket.on('remove_pump_loader', function(status) {
        aquas_manual_pump_toggle_container.find('label').text(status)
        aquas_manual_pump_toggle_container.find('.loader-container').removeClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    //End pump toggle event listener

    //Start light toggle event listener

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
        aquas_manual_light_toggle_container.find('label').text('')
        aquas_manual_light_toggle_container.find('.loader-container').addClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    socket.on('grow_light_off', function() {
        aquas_manual_light_toggle.prop('checked', false)
        aquas_manual_light_toggle_container.find('label').text('')
        aquas_manual_light_toggle_container.find('.loader-container').addClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    socket.on('remove_growlight_loader', function(status) {
        aquas_manual_light_toggle_container.find('label').text(status)
        aquas_manual_light_toggle_container.find('.loader-container').removeClass('fa fa-spinner fa-spin fa-2x fa-fw"')
    })

    //End light toggle event listener

    //Start feed scheduled changed event listener
    btn_submit_feed_scheduled.on('click', function() {

        socket.emit('feed_schedule_changed', {
            input_pakan_pagi: waktu_pakan_pagi.val(),
            input_pakan_siang: waktu_pakan_siang.val(),
            input_pakan_sore: waktu_pakan_sore.val(),
        });
    })

    //End feed scheduled changed event listener

    //Start feeder timeout changed event listener
    btn_submit_feeder_timeout.on('click', function() {
            socket.emit('feeder_timeout_changed', {
                feeder_timeout: feeder_timeout.val(),
            });
        })
        //End feeder timeout changed event listener




});