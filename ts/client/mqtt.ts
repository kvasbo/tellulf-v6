declare var mqtt_server;
declare var Paho;

$(window).on('load', function () {
    console.log('Loading MQTT', mqtt_server);
    mqttConnect();
});

function mqttConnect() {
    const split = mqtt_server.split(':');
    const uri = split[0] + ':' + split[1];
    const port = parseInt(split[2]);
    const mqtt = new Paho.MQTT.Client(
        '192.168.1.25',
        9001,
        'web_' + (Math.random() * 100, 10).toString()
    );
    const options = {
        timeout: 3,
        onSuccess: () => {
            console.log('MQTT connected');
            mqtt.subscribe('tellulf/#');
            const msg = new Paho.MQTT.Message('client poll');
            msg.destinationName = 'tellulf/poll';
            mqtt.send(msg);
        },
    };
    mqtt.onMessageArrived = (message) => {
        console.log(message.destinationName, message.payloadString);
        switch (message.destinationName) {
            case 'tellulf/power/used':
                $('.powerUsageTodayHome').text(message.payloadString);
                break;
        }
    };
    mqtt.connect(options);
}
