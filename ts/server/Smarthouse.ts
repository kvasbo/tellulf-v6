import { PowerPrices } from './PowerPrices';
import { Tibber } from './Tibber';
import { MqttClient } from './MQTT';

export class Smarthouse {
    private mqttClient;
    private tibberSubscription;

    constructor(mqttClient: MqttClient) {
        this.mqttClient = mqttClient;
        this.tibberSubscription = new Tibber(this.mqttClient);
    }

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

    public startMqtt() {
        this.mqttClient.client.on('message', (topic, message) => {
            switch (topic) {
                case 'tellulf/weather/tempOut':
                    this.temp = parseFloat(message.toString());
                    this.mqttClient.log('Temperature set to:', this.temp);
                    break;
                case 'tellulf/weather/humidity':
                    this.hum = parseFloat(message.toString());
                    this.mqttClient.log('Humidity set to:', this.hum);
                    break;
                case 'tellulf/weather/pressure':
                    this.pressure = parseFloat(message.toString());
                    this.mqttClient.log('Pressure set to:', this.pressure);
                    break;
                case 'tellulf/power/price':
                    this.powerPrice = parseFloat(message.toString());
                    this.mqttClient.log('Power price set to:', this.powerPrice);
                    break;
                case 'tellulf/power/used':
                    this.powerUsed = parseFloat(message.toString());
                    this.mqttClient.log('Power used set to:', this.powerUsed);
                    break;
                case 'tellulf/power/effect':
                    this.powerEffect = parseFloat(message.toString());
                    this.mqttClient.log(
                        'Power effect set to:',
                        this.powerEffect
                    );
                    break;
                case 'tellulf/power/cost':
                    this.powerCost = parseFloat(message.toString());
                    this.mqttClient.log('Power cost set to:', this.powerCost);
                    break;
                default:
                    break;
            }
        });
    }
}
