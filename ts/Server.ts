import express from "express";
import path from "path";
import { Days } from "./Days";
import { Clock } from "./Clock";
import { Entur } from "./Entur";
import { Settings } from "luxon";
import { Smarthouse } from "./Smarthouse";
import { MqttClient } from "./MQTT";

// Configure the time zone
Settings.defaultZone = "Europe/Oslo";

const app = express();

const mqttClient = new MqttClient();

// Create smarthouse connector
const smart = new Smarthouse(mqttClient);
smart.startMqtt();

// Express settings

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "twig");
app.use("/assets", express.static(path.join(__dirname, "../assets"))); // Static routes
app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "../assets/favicon.ico")),
);
app.use(
  "/jquery.js",
  express.static(
    path.join(__dirname, "../node_modules/jquery/dist/jquery.slim.min.js"),
  ),
);
app.use("/client.js", express.static(path.join(__dirname, "/Client.js")));
app.use(
  "/client.css",
  express.static(path.join(__dirname, "../assets/css/tellulf.css")),
);

const port = 3000;

const days = new Days();
const entur = new Entur();

app.get("/", (req, res) => {
  const data = {
    current_temperature: days.weather.getCurrentWeather().temperature,
    current_weather_icon: days.weather.getCurrentWeather().symbol,
    days: days.generateComingDays(),
    today: days.GenerateToday(),
    hourly_weather: days.weather.getHourlyForecasts(),
  };

  res.render("index.twig", data);
  console.log("Rendered index");
});

app.get("/time", (req, res) => {
  res.send(Clock.getTime());
});

app.get("/entur", async (req, res) => {
  const data = entur.Get();
  res.send(data);
});

// Get latest Homey data
app.get("/homey", (req, res) => {
  res.send(smart.getData());
});

app.listen(port, () => {
  console.log(`Tellulf listening on port ${port}`);
});
