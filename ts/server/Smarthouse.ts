import { PowerPrices } from './PowerPrices';
import { TibberData } from './Tibber';
import { MqttClient } from './MQTT';

export class Smarthouse {
    private mqttClient;

    constructor(mqttClient: MqttClient) {
        this.mqttClient = mqttClient;
    }

    private garageDoorOpen: null | boolean = null;
    private garageCarLeft: null | boolean = null;
    private garageDistanceLeft: null | number = null;

    private coolerRoomTemp = -9999;
    private coolerRoomHumidity = -9999;
    private coolerRoomBattery = -9999;

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
            garageIsOpen: this.garageDoorOpen,
            garageCarLeft: this.garageCarLeft,
        };
    }

    public startMqtt() {
        this.mqttClient.client.on('message', (topic, message) => {
            switch (topic) {
                case 'garage/left/OUT/JSON':
                    this.garageCarLeft =
                        JSON.parse(message.toString()).vehicle === 1;
                    this.garageDoorOpen =
                        JSON.parse(message.toString()).door === 1;
                    this.garageDistanceLeft =
                        JSON.parse(message.toString()).dist * 1;
                    this.mqttClient.log(
                        'Car in left garage space:',
                        this.garageCarLeft.toString()
                    );
                    this.mqttClient.log(
                        'Garage door open:',
                        this.garageDoorOpen.toString()
                    );
                    this.mqttClient.log(
                        'Space over left side car:',
                        this.garageDistanceLeft.toString()
                    );
                    break;
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
                case 'kjølerom/temperature':
                    this.coolerRoomTemp = parseFloat(message.toString());
                    console.log(this.coolerRoomTemp);
                    break;
                case 'kjølerom/humidity':
                    this.coolerRoomHumidity = parseFloat(message.toString());
                    console.log(this.coolerRoomHumidity);
                    break;
                case 'kjølerom/battery':
                    this.coolerRoomBattery = parseFloat(message.toString());
                    console.log(this.coolerRoomBattery);
                    break;
                default:
                    break;
            }
        });
    }
}
