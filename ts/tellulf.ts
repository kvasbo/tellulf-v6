declare const okular: any;

interface TimeData {
  time: string;
  date: string;
  week: string;
}

interface PowerData {
  usageToday: number;
  costToday: number;
}

interface PowerInfoSet {
  cabin: PowerData;
  home: PowerData;
}

interface HomeySet {
  age?: number;
  humOut?: string;
  power?: string;
  pressure?: string;
  tempOut?: string;
  time?: number;
}

$(function () {
  // Init time update
  updateTime();
  updateBattery();
  updatePowerUsage();
  updateHomey();
  setReload();
  window.setInterval(function () {
    updateTime();
  }, 5000);
  window.setInterval(function () {
    updatePowerUsage();
  }, 60000);
  window.setInterval(function () {
    updateHomey();
  }, 600000);
});

// Update time from the server
function updateTime() {
  jQuery.get("/time").then((timeData: TimeData) => {
    $("#now_time").html(timeData.time);
    $("#now_date").html(timeData.date);
    $("#now_week").html(`Uke ${timeData.week}`);
  });
}

/**
 * Live update power usage.
 */
function updatePowerUsage() {
  jQuery.get("/tibber").then((d: PowerInfoSet) => {
    $(".powerUsageTodayHome").html(Math.round(d.home.usageToday).toString());
    $(".powerUsageTodayCabin").html(Math.round(d.cabin.usageToday).toString());
    $(".powerCostTodayHome").html(Math.round(d.home.costToday).toString());
    $(".powerCostTodayCabin").html(Math.round(d.cabin.costToday).toString());
  });
}

function updateHomey() {
  jQuery.get("/homey").then((d: HomeySet) => {
    if (d.tempOut && d.age && d.age < 60) {
      const t = Number(d.tempOut).toFixed(1);
      $(".current_temperature").html(`${t}&deg;`);
    }
  });
}

function updateBattery() {
  try {
    if (okular && okular.DevicesStatus) {
      const status = okular.DevicesStatus();
      const battery = status["28003d00-0f47-3830-3933-303600000000"]["Battery"];
      $(".battery").html(`${battery}%`);
    }
  } catch (e) {}
}

/**
 * Reload at the start of the hour.
 */
function setReload() {
  const now = new Date();
  const startOfNextHour = new Date();
  startOfNextHour.setUTCHours(now.getUTCHours() + 1, 0, 1, 0);
  const diff = startOfNextHour.getTime() - now.getTime();
  setTimeout(() => window.location.reload(), diff);
}
