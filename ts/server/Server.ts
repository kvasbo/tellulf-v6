import express from 'express';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from 'redis';
import { Days } from './Days';
import { Clock } from './Clock';
import { Entur } from './Entur';
import { Settings } from 'luxon';
import { Smarthouse } from './Smarthouse';
import { MqttClient } from './MQTT';
import { Tibber } from './Tibber';

// Configure the time zone
Settings.defaultZone = 'Europe/Oslo';

// Get environment variables
dotenv.config();

// Create redis client
const redisClient = createClient({
    url: process.env.REDIS_HOST ? process.env.REDIS_HOST.toString() : '',
});

const app = express();

const mqttClient = new MqttClient();

// Create smarthouse connector
const smart = new Smarthouse(mqttClient, redisClient);
smart.startMqtt();

new Tibber(mqttClient);

// Express settings

const port = 3000;

const days = new Days();
const entur = new Entur();

async function start() {
    await initRedis();
    initExpress();
    registerEndpoints();
    app.listen(port, () => {
        console.log(`Tellulf listening on port ${port}`);
    });
}

start();

function initExpress() {
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'twig');
    app.use('/assets', express.static(path.join(__dirname, '../assets'))); // Static routes
    app.use(
        '/favicon.ico',
        express.static(path.join(__dirname, '../assets/favicon.ico'))
    ); // Static routes
}

async function initRedis() {
    const redisClient2 = await createClient({
        url: process.env.REDIS_HOST ? process.env.REDIS_HOST.toString() : '',
    });
    console.log(typeof redisClient2);
    await redisClient.connect();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('ready', () => console.log('Redis Client Ready'));
    await redisClient.set('last_boot', new Date().toUTCString());
}

function registerEndpoints() {
    app.get('/', (req, res) => {
        const data = {
            current_temperature: days.weather.getCurrentWeather().temperature,
            current_weather_icon: days.weather.getCurrentWeather().symbol,
            days: days.generateComingDays(),
            today: days.GenerateToday(),
            hourly_weather: days.weather.getHourlyForecasts(),
        };

        res.render('index.twig', data);
        console.log('Rendered index');
    });

    app.get('/time', (req, res) => {
        res.send(Clock.getTime());
    });

    app.get('/entur', async (req, res) => {
        const data = entur.Get();
        res.send(data);
    });

    // Get latest Homey data
    app.get('/homey', (req, res) => {
        res.send(smart.getData());
    });
}
