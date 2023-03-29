declare const okular: any;

interface TimeData {
  time: string;
  date: string;
  week: string;
}

interface HomeySet {
  age?: number;
  humOut?: string;
  power?: string;
  pressure?: string;
  tempOut?: string;
  powerUsedToday?: string;
  time?: number;
  co2in?: string;
  powerCostNow?: string;
  hourlyCostNow: string;
  tempIn?: string;
  humIn?: string;
  costToday?: string;
}
interface EnturTur {
  time: string;
  destination: string;
}

interface PowerPrice {
  EUR_per_kWh: number;
  NOK_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
}

interface PowerPriceSet {
  'now'?: PowerPrice;
  [key: number]: PowerPrice;
}

// Run every fifteen seconds, plus once when starting up
$(function () {
  setReload(1);
  runUpdateLoop(true);
  window.setInterval(function () {
    runUpdateLoop();
  }, 15000);
});

// Run the update loop
async function runUpdateLoop(force = false) {
  // Run the Ajax calls concurrently (note: the order is important)
  const calls = [
    jQuery.get("/time"),
    jQuery.get("/homey"),
    jQuery.get("/entur"),
  ];

  // Wait for all of them to return
  const data = await Promise.all(calls);

  // Unwrap the returned data (this is why the order is important)
  const timeData: TimeData = data[0];
  updateTimeInfo(timeData);

  const homey: HomeySet = data[1];

  const entur: EnturTur[] = data[2];
  updateEnturInfo(entur);

  if (homey.age && homey.age < 600) {
    if (homey.tempOut) {
      const t = Number(homey.tempOut).toFixed(1);
      $(".current_temperature").html(`${t}&deg;`);
    } else {
      $(".current_temperature").html(`?`);
    }
    if (homey.pressure) {
      const p = Number(homey.pressure).toFixed(0);
      $(".current_pressure").html(`${p} hPa`);
    }
    if (homey.humOut) {
      const p = Number(homey.humOut).toFixed(0);
      $(".current_humidity").html(`${p} % hum`);
    }
    
    if (homey.power) {
      const p = Math.round(Number(homey.power)/100)/10;
      $(".current_power").html(`${p} kW`);
    }
    if (homey.powerUsedToday) {
      $(".powerUsageTodayHome").html(
        Math.round(Number(homey.powerUsedToday)).toString()
      );
    }
    if (homey.powerCostNow) {
      const currentPowePrice = +homey.powerCostNow;
      $(".current_price").html(
        `${currentPowePrice.toFixed(2)} kr/kWh`
      );
    }
    if (homey.costToday) {
      const costToday = +homey.costToday;
      $(".powerCostTodayHome").html(
        `${costToday.toFixed(2)}`
      );
    }
  }
}

function updateTimeInfo(timeData: TimeData) {
  // Update all the interfaces at once
  $("#now_time").html(timeData.time);
  $("#now_date").html(timeData.date);
  $("#now_week").html(`Uke ${timeData.week}`);
}

function updateEnturInfo(entur: EnturTur[]) {
  
  let enturHtml = "Neste to baner: ";
  
  for (let i = 0; i < Math.min(entur.length, 2); i++) {
    enturHtml += `<span class="entur_item">${entur[i].time.substring(
      11,
      16
    )}</span>`;
  }

  $(".bane").html(enturHtml);
}

/**
 * Reload at the start of the hour.
 */
function setReload(inHours: number) {
  const now = new Date();
  const startOfNextHour = new Date();
  startOfNextHour.setUTCHours(now.getUTCHours() + inHours, 0, 1, 0);
  const diff = startOfNextHour.getTime() - now.getTime();
  setTimeout(() => window.location.reload(), diff);
}
