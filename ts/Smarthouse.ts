import { TibberData } from './Tibber';
import { MqttClient } from './MQTT';
import { PowerStatus, PowerStatusForPlace } from './Types';

export class Smarthouse {
    private mqttClient;

    constructor(mqttClient: MqttClient) {
        this.mqttClient = mqttClient;
    }

    private coolerRoomTemp = -9999;
    private coolerRoomHumidity = -9999;
    private coolerRoomBattery = -9999;

    private status: PowerStatus = {
        home: structuredClone(statusInitValues),
        cabin: structuredClone(statusInitValues),
    };

    private temp = -9999;
    private hum = -9999;
    private pressure = 0;

    public getData(): HomeyData {
        const hour = new Date().getHours();
        const costHome =
            this.status.home.prices[hour].total +
            this.status.home.prices[hour].transportCost;
        const costCabin =
            this.status.cabin.prices[hour].total +
            this.status.cabin.prices[hour].transportCost;
        const output = {
            tempOut: this.temp,
            humOut: this.hum,
            pressure: this.pressure,
            powerCostNowCabin: costCabin,
            powerCostNowHome: costHome,
            powerUsedToday: this.status.home.day.accumulatedConsumption,
            power: this.status.home.power,
            costToday: this.status.home.day.accumulatedCost,
            powerCabin: this.status.cabin.power,
            powerUsedTodayCabin: this.status.cabin.day.accumulatedConsumption,
            costTodayCabin: this.status.cabin.day.accumulatedCost,
            coolerRoomHumidity: this.coolerRoomHumidity,
            coolerRoomTemp: this.coolerRoomTemp,
            coolerRoomBattery: this.coolerRoomBattery,
        };
        return output;
    }

    private parseTibberData(message: string) {
        // Convert to object
        const data: PowerStatus = JSON.parse(message);
        // Set internal status.
        this.status = data;
    }

    public startMqtt() {
        this.mqttClient.client.on('message', (topic, message) => {
            const msg = message.toString();
            switch (topic) {
                // The big new one!
                case 'tibber/power':
                    this.parseTibberData(msg);
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
                case 'kjølerom/temperature':
                    this.coolerRoomTemp = parseFloat(message.toString());
                    break;
                case 'kjølerom/humidity':
                    this.coolerRoomHumidity = parseFloat(message.toString());
                    break;
                case 'kjølerom/battery':
                    this.coolerRoomBattery = parseFloat(message.toString());
                    break;
                default:
                    break;
            }
        });
    }
}

const statusInitValues: PowerStatusForPlace = {
    power: 0,
    day: {
        accumulatedConsumption: 0,
        accumulatedProduction: 0,
        accumulatedCost: 0,
    },
    month: {
        accumulatedConsumption: 0,
        accumulatedProduction: 0,
        accumulatedCost: 0,
    },
    minPower: 0,
    averagePower: 0,
    maxPower: 0,
    accumulatedReward: 0,
    powerProduction: 0,
    minPowerProduction: 0,
    maxPowerProduction: 0,
    usageForDay: {},
    prices: {},
};
