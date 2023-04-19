import mqtt from 'mqtt';
import * as dotenv from 'dotenv';
import { PowerPrices } from './PowerPrices';
import { Tibber } from './Tibber';

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
    clientId: 'tellulf' + Math.random().toString(16).substr(2, 8),
};

export class Smarthouse {
    static client: mqtt.MqttClient;

    // Tibber realtime subscription
    private tibberSubscription: Tibber = new Tibber();

    private temp = -9999;
    private hum = -9999;
    private pressure = 0;

    private powerPrice = -1;
    private powerUsed = -1;
    private powerEffect = -1;
    private powerCost = -1;

    public getData() {
        let currentConsumptionCabin =
            this.tibberSubscription.powerData.cabin.power;
        if (
            currentConsumptionCabin === 0 &&
            this.tibberSubscription.powerData.cabin.powerProduction
        ) {
            currentConsumptionCabin =
                this.tibberSubscription.powerData.cabin.powerProduction * -1;
        }
        const usedTodayCabin =
            this.tibberSubscription.powerData.cabin.accumulatedConsumption -
            this.tibberSubscription.powerData.cabin.accumulatedProduction;

        const costTodayCabin = this.tibberSubscription.powerData.cabin
            .accumulatedReward
            ? this.tibberSubscription.powerData.cabin.accumulatedCost -
              this.tibberSubscription.powerData.cabin.accumulatedReward
            : this.tibberSubscription.powerData.cabin.accumulatedCost;

        return {
            tempOut: this.temp,
            humOut: this.hum,
            pressure: this.pressure,
            powerCostNow: PowerPrices.getCurrentPrice(
                this.powerPrice,
                new Date()
            ),
            powerUsedToday:
                this.tibberSubscription.powerData.home.accumulatedConsumption,
            power: this.tibberSubscription.powerData.home.power,
            costToday: this.tibberSubscription.powerData.home.accumulatedCost,
            powerCabin: currentConsumptionCabin,
            powerUsedTodayCabin: usedTodayCabin,
            costTodayCabin: costTodayCabin,
        };
    }

    private static log(message: string, value: number | string) {
        const d = new Date();
        console.log(d.toISOString(), 'MQTT ' + message, value);
    }

    Connect() {
        Smarthouse.client = mqtt.connect(options);

        Smarthouse.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            Smarthouse.client.subscribe('tellulf/#');
            Smarthouse.client.publish(
                'tellulf/poll',
                'Tellulf is online and polling'
            );
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
    }
}
