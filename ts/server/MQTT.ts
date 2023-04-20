import mqtt from 'mqtt';
import * as dotenv from 'dotenv';

dotenv.config();

const MQTT_URL = process.env.MQTT_URL as string;
const MQTT_PORT = process.env.MQTT_PORT as string;
const MQTT_USER = process.env.MQTT_USER as string;
const MQTT_PASS = process.env.MQTT_PASS as string;

const options: mqtt.IClientOptions = {
    host: MQTT_URL,
    port: Number(MQTT_PORT),
    protocol: 'mqtts',
    username: MQTT_USER,
    password: MQTT_PASS,
    clientId: 'tellulf-' + Math.random().toString(16).substr(2, 8),
};

export class MqttClient {
    public client: mqtt.MqttClient;

    constructor() {
        this.client = mqtt.connect(options);
        this.client.on('connect', () => {
            console.log(
                'Tellulf Connected to MQTT broker with client ID ' +
                    options.clientId
            );
            this.client.subscribe('tellulf/#');
            this.client.publish(
                'tellulf/poll',
                'Tellulf is online and polling'
            );
        });
    }

    public publish(topic: string, message: string) {
        this.client.publish(topic, message);
    }

    public log(message: string, value: number | string) {
        const d = new Date();
        console.log(d.toISOString(), 'MQTT ' + message, value);
    }
}
