import express from 'express';
import path from 'path';
import { Calendar } from './Calendar';
import { Clock } from './Clock';
import { Entur } from './Entur';
import { Homey, HomeyData } from './Homey';
import { Weather } from './Weather';
import Twig from 'twig';

require('dotenv').config();

const app = express();

// Express settings

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'twig');
app.use(express.static('public')); // Static routes
app.use('/assets', express.static(path.join(__dirname, '../assets')));

const port = process.env.TELLULF_PORT ? process.env.TELLULF_PORT : 3000;

const weather = new Weather();

app.get('/', (req, res) => {
  res.render('index.twig', {});
})

app.get('/time', (req, res) => {
  res.send(Clock.getTime());
});

app.get('/calendar', (req, res) => {
  res.send(Calendar.getEvents());
});

app.get('/entur', async (req, res) => {
  const data = await Entur.Get();
  res.send(data);
});

// Get latest Homey data
app.get("/homey", (req, res) => {
  res.send(Homey.Get_Latest_Data());
});

// Store changes from Homey
app.get("/homey_put", (req, res) => {
  const data = req.query as HomeyData;
  Homey.Set_Data(data);
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Tellulf listening on port ${port}`);
})
