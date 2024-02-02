/* eslint-disable no-undef */
/**
 * This file is the client side of the dashboard. It is not run on the server, but served as is to the client.
 */

type Train = {
  time: string;
  destination: string;
};

type HomeyData = {
  tempOut?: number;
  humOut?: number;
  power?: number;
  pressure?: number;
  powerUsedToday?: number;
  costToday?: number;
  powerCostNowHome?: number;
  powerCostNowCabin?: number;
  tempIn?: number;
  humIn?: number;
  co2in?: number;
  niceTime?: string;
  powerUsedTodayCabin?: number;
  powerCabin?: number;
  costTodayCabin?: number;
  coolerRoomTemp: number;
  coolerRoomHumidity: number;
  coolerRoomBattery: number;
};

type TimeData = {
  time: string;
  date: string;
  week: string;
};

let lastUpdatedPower = new Date();

// Reload the page every fifteen seconds
$(function () {
  setReloadClient(1);
});

async function connectWebSocket() {
  const ws = new WebSocket(
    "ws://" + window.location.hostname + ":" + window.location.port,
  );

  ws.onopen = function () {
    // Web Socket is connected, identify ourselves
    ws.send(
      JSON.stringify({
        message: "Hello, from Tellulf!",
        type: "identify",
        id:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
      }),
    );
  };

  ws.onclose = function () {
    $("#now_time").html(`Frakoblet`);
    $("#now_date").html(`(╯°□°)╯︵ ┻━┻`);
    // Connection has been closed, attempt to reconnect
    setTimeout(function () {
      connectWebSocket();
    }, 5000); // Try to reconnect after 2 seconds
  };

  ws.onerror = function (error) {
    // Handle errors
    console.log("WebSocket error:", error);
  };

  ws.onmessage = function (evt) {
    try {
      const data = JSON.parse(evt.data);
      if (data.time) {
        updateTimeInfo(data.time);
      }
      if (data.homey) {
        updateHomeyInfo(data.homey);
      }
      if (data.entur) {
        updateEnturInfo(data.entur);
      }
      if (data.hourlyForecast) {
        updateHourlyForecast(data.hourlyForecast);
      }
    } catch (e) {
      console.log(e);
    }
  };
}

connectWebSocket();

/**
 * Update the hourly forecast
 */
function updateHourlyForecast(forecast: unknown) {
  if (Array.isArray(forecast) && forecast.length > 0) {
    const template = hourlyWeatherTemplate.render({
      hourly_weather: forecast,
    });
    const current = $(".weather_nowcast").html;
    if (current !== template) {
      $(".weather_nowcast").html(template);
    } else {
      console.log("Not updating hourly forecast, no changes");
    }
  }
}

/**
 * Update the UX with homey data.
 * @param homey
 */
function updateHomeyInfo(homey: HomeyData) {
  // Show temperature
  if (homey.tempOut) {
    const t = Number(homey.tempOut).toFixed(0);
    if (t === "-0") {
      $(".current_temperature").html(`0&deg;`);
    } else {  
      $(".current_temperature").html(`${t}&deg;`);
    }
  } else {
    $(".current_temperature").html(`?`);
  }

  // Show pressure
  if (homey.pressure) {
    const p = Number(homey.pressure).toFixed(0);
    $(".current_pressure").html(`${p} hPa`);
  }

  // Show humidity
  if (homey.humOut) {
    const p = Number(homey.humOut).toFixed(0);
    $(".current_humidity").html(`${p} % hum`);
  }

  if (homey.power) {
    setLastUpdatedPowerTime();
    const p = Math.round(Number(homey.power) / 100) / 10;
    $(".current_power").html(`${p} kW`);
  }
  if (homey.powerUsedToday) {
    $(".powerUsageTodayHome").html(
      Math.round(Number(homey.powerUsedToday)).toString(),
    );
  }
  if (homey.powerCostNowHome) {
    const currentPowerPrice = homey.powerCostNowHome;
    $(".currentPriceHome").html(`${currentPowerPrice.toFixed(2)} kr/kWh`);
  }
  if (homey.powerCostNowCabin) {
    const currentPowePriceCabin = homey.powerCostNowCabin;
    $(".currentPriceCabin").html(`${currentPowePriceCabin.toFixed(2)} kr/kWh`);
  }
  if (homey.costToday) {
    const costToday = +homey.costToday;
    $(".powerCostTodayHome").html(`${costToday.toFixed(0)}`);
  }
  if (homey.powerUsedTodayCabin) {
    $(".powerUsageTodayCabin").html(
      Math.round(Number(homey.powerUsedTodayCabin)).toString(),
    );
  }
  if (homey.powerCabin !== undefined) {
    const p = Math.round(Number(homey.powerCabin) / 100) / 10;
    $(".currentPowerCabin").html(`${p} kW`);
  }
  if (homey.costTodayCabin !== undefined) {
    const costToday = homey.costTodayCabin;
    $(".powerCostTodayCabin").html(`${costToday.toFixed(0)}`);
  }
  if (homey.coolerRoomTemp !== null) {
    const coolerTemp = homey.coolerRoomTemp;
    $(".coolerTemp").html(coolerTemp.toString());
  }
  if (homey.coolerRoomHumidity !== null) {
    const coolerHum = homey.coolerRoomHumidity;
    $(".coolerHumidity").html(coolerHum.toString());
  }

  // Remove power data if not updated lately
  checkLastUpdatedPowerTime();
}

function setLastUpdatedPowerTime() {
  lastUpdatedPower = new Date();
}

function checkLastUpdatedPowerTime() {
  const now = new Date();
  const diff = now.getTime() - lastUpdatedPower.getTime();
  const diffMinutes = Math.round(diff / 1000 / 60);

  if (diffMinutes > 1) {
    $(".current_power").html(`?`);
    $(".current_price").html(`?`);
    $(".powerUsageTodayHome").html(`?`);
    $(".powerCostTodayHome").html(`?`);
  }
}

function updateTimeInfo(timeData: TimeData) {
  // Update all the interfaces at once
  $("#now_time").html(timeData.time);
  $("#now_date").html(timeData.date);
  $("#now_week").html(`Uke ${timeData.week}`);
}

function updateEnturInfo(entur: Train[]) {
  let enturHtml = "<strong>Neste baner:</strong>";

  for (let i = 0; i < Math.min(entur.length, 4); i++) {
    enturHtml += `<span class="entur_item">${entur[i].time.substring(
      11,
      16,
    )}</span>`;
  }

  $(".bane").html(enturHtml);
}

/**
 * Reload at the start of the hour.
 */
function setReloadClient(inHours: number) {
  const now = new Date();
  const startOfNextHour = new Date();
  startOfNextHour.setUTCHours(now.getUTCHours() + inHours, 0, 1, 0);
  const diff = startOfNextHour.getTime() - now.getTime();
  setTimeout(() => window.location.reload(), diff);
}
