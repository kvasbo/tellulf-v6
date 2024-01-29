import express from "express";
import path from "path";
import WebSocket from "ws";
import http from "http";
import { Days } from "./Days";
import { Clock } from "./Clock";
import { Entur } from "./Entur";
import { Weather } from "./Weather";
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
app.use(
  "/twig.js",
  express.static(path.join(__dirname, "../node_modules/twig/twig.min.js")),
);
app.use("/client_templates.js", express.static(path.join(__dirname, "/Client_templates.js")));
app.use("/client.js", express.static(path.join(__dirname, "/Client.js")));
app.use(
  "/client.css",
  express.static(path.join(__dirname, "../assets/css/tellulf.css")),
);

const port = 3000;

const days = new Days();
const entur = new Entur();
const weather = new Weather();

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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients: WebSocket[] = [];

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    ws.send(JSON.stringify({ message: "Hello, from Tellulf Server!" }));
  });

  ws.on("close", () => {
    console.log("Client disconnecting", clients.length);
    clients.splice(clients.indexOf(ws), 1);
    console.log("Client disconnected", clients.length);
  });

  clients.push(ws);
  console.log("Client connected", clients.length);

  // Run the update loop immediately (for all clients, but hey, it's just a clock)
  updateClocks(false);
  pushDataToClients();
});

server.listen(port, () => {
  console.log(`Tellulf listening on port ${port} for both WS and HTTP`);
});

/**
 * Push data to all connected clients
 */
function pushDataToClients() {
  console.log("Pushing updated data to connected clients");
  const homey = smart.getData();
  const enturData = entur.Get();
  const hourlyForecast = weather.getHourlyForecasts();
  const currentWeather = weather.getCurrentWeather();
  const longTermForecast = weather.getDailyForecasts();
  clients.forEach((client) => {
    client.send(
      JSON.stringify({
        homey,
        entur: enturData,
        hourlyForecast,
        currentWeather,
        longTermForecast,
      }),
    );
  });
}

// Run the update loop for the clock once per minute
function updateClocks(queueNext: boolean = true) {
  console.log(
    `Sending time (${new Date().toLocaleTimeString()}) to ${
      clients.length
    } clients", `,
  );

  // Recalculate the delay until the start of the next minute
  const now = new Date();
  const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

  const timePayload = JSON.stringify({
    time: Clock.getTime(),
  });

  clients.forEach((client) => {
    client.send(timePayload);
  });

  // Set a timeout for the next execution
  if (queueNext) {
    setTimeout(updateClocks, delay);
  }
}

updateClocks();
pushDataToClients();
setInterval(pushDataToClients, 10000);

// Handle sigterm
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close(() => {
    console.log("Http server closed.");
    process.exit(0);
  });
});
