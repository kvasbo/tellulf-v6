import express from 'express';
import path from 'path';
import { Days } from './Days';
import { Clock } from './Clock';
import { Entur } from './Entur';
import { Homey, HomeyData } from './Homey';
import Twig from 'twig';
import { Settings } from "luxon";

// Configure the time zone
Settings.defaultZone = "Europe/Oslo";


require('dotenv').config();

const app = express();

// Express settings

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'twig');
app.use('/assets', express.static(path.join(__dirname, '../assets'))); // Static routes

const port = 3000;

const days = new Days();

// Start update loops
Homey.Update_Data_From_Homey();
setInterval(() => { Homey.Update_Data_From_Homey() }, 15000);

app.get('/', (req, res) => {

  const data = {
    "current_temperature": days.weather.getCurrentWeather().temperature,
    "current_weather_icon": days.weather.getCurrentWeather().symbol,
    "days": days.generateComingDays(),
    "today": days.GenerateToday(),
    "hourly_weather": days.weather.getHourlyForecasts(),
  };

  // TODO: Keep regenerating today and coming days

  res.render('index.twig', data);
  console.log("Rendered index");
})

app.get('/time', (req, res) => {
  res.send(Clock.getTime());
});

app.get('/entur', async (req, res) => {
  const data = await Entur.Get();
  res.send(data);
});

// Get latest Homey data
app.get("/homey", (req, res) => {
  res.send(Homey.Get_Latest_Data());
});

app.listen(port, () => {
  console.log(`Tellulf listening on port ${port}`);
})
