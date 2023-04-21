import { PowerPrices } from './PowerPrices';
import { TibberData } from './Tibber';
import { MqttClient } from './MQTT';

export class Smarthouse {
    private mqttClient;

    constructor(mqttClient: MqttClient) {
        this.mqttClient = mqttClient;
    }

    private powerData: { home: TibberData; cabin: TibberData } = {
        home: {
            timestamp: '',
            power: 0,
            accumulatedConsumption: 0,
            accumulatedProduction: 0,
            accumulatedCost: 0,
            minPower: 0,
            averagePower: 0,
            maxPower: 0,
            accumulatedReward: 0,
            powerProduction: 0,
            minPowerProduction: 0,
            maxPowerProduction: 0,
        },
        cabin: {
            timestamp: '',
            power: 0,
            accumulatedConsumption: 0,
            accumulatedProduction: 0,
            accumulatedCost: 0,
            minPower: 0,
            averagePower: 0,
            maxPower: 0,
            accumulatedReward: 0,
            powerProduction: 0,
            minPowerProduction: 0,
            maxPowerProduction: 0,
        },
    };

    private temp = -9999;
    private hum = -9999;
    private pressure = 0;

    private powerPrice = -1;

    public getData() {
        return {
            tempOut: this.temp,
            humOut: this.hum,
            pressure: this.pressure,
            powerCostNow: PowerPrices.getCurrentPrice(
                this.powerPrice,
                new Date()
            ),
            powerUsedToday: this.powerData.home.accumulatedConsumption,
            power: this.powerData.home.power,
            costToday: this.powerData.home.accumulatedCost,
            powerCabin: this.powerData.cabin.power,
            powerUsedTodayCabin: this.powerData.cabin.accumulatedConsumption,
            costTodayCabin: this.powerData.cabin.accumulatedCost,
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
                case 'tellulf/tibber/price/total':
                    this.powerPrice = parseFloat(message.toString());
                    this.mqttClient.log('Power price set to:', this.powerPrice);
                    break;
                case 'tellulf/tibber/home/power':
                    this.powerData.home.power = parseFloat(message.toString());
                    this.mqttClient.log(
                        'Power home set to:',
                        this.powerData.home.power
                    );
                    break;
                case 'tellulf/tibber/cabin/power':
                    this.powerData.cabin.power = parseFloat(message.toString());
                    this.mqttClient.log(
                        'Power cabin set to:',
                        this.powerData.cabin.power
                    );
                    break;
                case 'tellulf/tibber/home/accumulatedCost':
                    this.powerData.home.accumulatedCost = parseFloat(
                        message.toString()
                    );
                    this.mqttClient.log(
                        'Accumulated cost home set to:',
                        this.powerData.home.accumulatedCost
                    );
                    break;
                case 'tellulf/tibber/cabin/accumulatedCost':
                    this.powerData.cabin.accumulatedCost = parseFloat(
                        message.toString()
                    );
                    this.mqttClient.log(
                        'Accumulated cost cabin set to:',
                        this.powerData.cabin.accumulatedCost
                    );
                    break;
                case 'tellulf/tibber/home/accumulatedConsumption':
                    this.powerData.home.accumulatedConsumption = parseFloat(
                        message.toString()
                    );
                    this.mqttClient.log(
                        'Accumulated consumption home set to:',
                        this.powerData.home.accumulatedConsumption
                    );
                    break;
                case 'tellulf/tibber/cabin/accumulatedConsumption':
                    this.powerData.cabin.accumulatedConsumption = parseFloat(
                        message.toString()
                    );
                    this.mqttClient.log(
                        'Accumulated consumption cabin set to:',
                        this.powerData.cabin.accumulatedConsumption
                    );
                    break;
                default:
                    break;
            }
        });
    }
}
