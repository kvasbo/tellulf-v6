/**
 * This file is the client side of the dashboard. It is not run on the server, but served as is to the client.
 */

let eventsHash = "";

let ws = null;
let wsRetryCount = 0;
let lastHourlyForecast = "";

const wsId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

/**
 * @typedef {object} Train
 * @property {string} time
 * @property {string} destination
 */

/**
 * @typedef {object} HomeyData
 * @property {number} [tempOut]
 * @property {number} [humOut]
 * @property {number} [power]
 * @property {number} [pressure]
 * @property {number} [powerUsedToday]
 * @property {number} [costToday]
 * @property {number} [powerCostNowHome]
 * @property {number} [powerCostNowCabin]
 * @property {number} [tempIn]
 * @property {number} [humIn]
 * @property {number} [co2in]
 * @property {string} [niceTime]
 * @property {number} [powerUsedTodayCabin]
 * @property {number} [powerCabin]
 * @property {number} [costTodayCabin]
 * @property {number} coolerRoomTemp
 * @property {number} coolerRoomHumidity
 * @property {number} coolerRoomBattery
 */

/**
 * @typedef {object} TimeData
 * @property {string} time
 * @property {string} date
 * @property {string} week
 */

let lastUpdatedPower = new Date();

// Reload the page every fifteen seconds
$(function () {
  setReloadClient(1);
});

/**
 * Connect to the WebSocket and handle reconnections and messages.
 */
async function connectWebSocket() {
  // Reload window if we have retried too many times
  if (wsRetryCount > 10) {
    console.log("Too many retries, giving up");
    window.location.reload();
  }
  wsRetryCount++;

  ws = new WebSocket(
    "ws://" + window.location.hostname + ":" + window.location.port,
  );

  ws.onopen = function () {
    // Web Socket is connected, identify ourselves
    ws.send(
      JSON.stringify({
        message: `Hello, from ${wsId}!`,
        type: "identify",
        id: wsId,
      }),
    );
  };

  ws.onclose = function () {
    $("#now_time").html(`Frakoblet`);
    $("#now_date").html(`(╯°□°)╯︵ ┻━┻`);
    // Connection has been closed, attempt to reconnect
    setTimeout(function () {
      connectWebSocket();
    }, 15000); // Try to reconnect after 15 seconds
  };

  ws.onerror = function (error) {
    // Handle errors
    console.log("WebSocket error:", error);
    setTimeout(function () {
      connectWebSocket();
    }, 5000); // Try to reconnect after 5 seconds
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
      if (data.powerPrice) {
        const currentPowerPrice = data.powerPrice;
        // Round to two decimals
        const roundedPrice = Math.round(currentPowerPrice * 100) / 100;
        $(".currentPriceHome").html(`${roundedPrice} kr/kWh`);
      }
      if (data.eventsHash) {
        if (eventsHash === "") {
          eventsHash = data.eventsHash;
        } else if (eventsHash !== "" && eventsHash !== data.eventsHash) {
          console.log("Events hash updated");
          window.location.reload();
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
}

connectWebSocket();

/**
 * Update the UX with Homey data.
 * @param {HomeyData} homey
 */
function updateHomeyInfo(homey) {
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

/**
 * Set the last updated power time to the current time.
 */
function setLastUpdatedPowerTime() {
  lastUpdatedPower = new Date();
}

/**
 * Check the last updated power time and update the UI if too much time has passed.
 */
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

/**
 * Update the time information in the UI.
 * @param {TimeData} timeData
 */
function updateTimeInfo(timeData) {
  // Update all the interfaces at once
  $("#now_time").html(timeData.time);
  $("#now_date").html(timeData.date);
  $("#now_week").html(`Uke ${timeData.week}`);
}

/**
 * Update the train information in the UI.
 * @param {Train[]} entur
 */
function updateEnturInfo(entur) {
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
 * Reload the page at the start of the next hour.
 * @param {number} inHours
 */
function setReloadClient(inHours) {
  const now = new Date();
  const startOfNextHour = new Date();
  startOfNextHour.setUTCHours(now.getUTCHours() + inHours, 0, 1, 0);
  const diff = startOfNextHour.getTime() - now.getTime();
  setTimeout(() => window.location.reload(), diff);
}
