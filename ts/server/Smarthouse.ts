import mqtt from 'mqtt';
import * as dotenv from 'dotenv';

dotenv.config();

const MQTT_URL = process.env.MQTT_URL ? process.env.MQTT_URL : '';

export class Smarthouse {
    static client: mqtt.MqttClient;

    private temp = -9999;
    private hum = -9999;
    private pressure = 0;

    private powerPrice = -1;
    private powerUsed = -1;
    private powerEffect = -1;
    private powerCost = -1;

    public getData() {
        return {
            tempOut: this.temp,
            humIn: this.hum,
            pressure: this.pressure,
            powerCostNow: this.powerPrice,
            powerUsedToday: this.powerUsed,
            power: this.powerEffect,
            costToday: this.powerCost,
        };
    }

    private static log(message: string, value: number | string) {
        const d = new Date();
        console.log(d.toISOString(), 'MQTT ' + message, value);
    }

    Connect() {
        Smarthouse.client = mqtt.connect(MQTT_URL);

        Smarthouse.client.on('connect', () => {
            Smarthouse.client.subscribe('tellulf/#');
        });

        Smarthouse.client.on('message', (topic, message) => {
            switch (topic) {
                case 'tellulf/weather/tempOut':
                    this.temp = parseFloat(message.toString());
                    Smarthouse.log('Temperature set to:', this.temp);
                    break;
                case 'tellulf/weather/humidity':
                    this.hum = parseFloat(message.toString());
                    Smarthouse.log('Humidity set to:', this.hum);
                    break;
                case 'tellulf/weather/pressure':
                    this.pressure = parseFloat(message.toString());
                    Smarthouse.log('Pressure set to:', this.pressure);
                    break;
                case 'tellulf/power/price':
                    this.powerPrice = parseFloat(message.toString());
                    Smarthouse.log('Power price set to:', this.powerPrice);
                    break;
                case 'tellulf/power/used':
                    this.powerUsed = parseFloat(message.toString());
                    Smarthouse.log('Power used set to:', this.powerUsed);
                    break;
                case 'tellulf/power/effect':
                    this.powerEffect = parseFloat(message.toString());
                    Smarthouse.log('Power effect set to:', this.powerEffect);
                    break;
                case 'tellulf/power/cost':
                    this.powerCost = parseFloat(message.toString());
                    Smarthouse.log('Power cost set to:', this.powerCost);
                    break;
                default:
                    console.log(
                        'Message received: ',
                        topic,
                        message.toString()
                    );
                    break;
            }
        });

        // Initialize
        Smarthouse.client.publish('tellulf/poll', 'poll');
    }
}
