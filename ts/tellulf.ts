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

  updateBattery();
  setReload();

  // New
  runUpdateLoop(true);
  window.setInterval(function () {
    runUpdateLoop();
  }, 60000);
  // End new
});

// Run the update loop
async function runUpdateLoop(force = false) {
  // Run the Ajax calls concurrently (note: the order is important)
  const calls = [
    jQuery.get("/time"),
    jQuery.get("/tibber"),
    jQuery.get("/homey"),
  ];

  const data = await Promise.all(calls);

  // Unwrap the returned data
  const timeData: TimeData = data[0];
  const powerData: PowerInfoSet = data[1];
  const homey: HomeySet = data[2];

  // Only every ten minutes or on force
  const minutes = new Date().getMinutes();
  if (minutes % 10 === 0 || force) {
    updateWeatherGraph();
    updateBattery();
  }

  // Update all the interfaces at once
  $("#now_time").html(timeData.time);
  $("#now_date").html(timeData.date);
  $("#now_week").html(`Uke ${timeData.week}`);
  $(".powerUsageTodayHome").html(
    Math.round(powerData.home.usageToday).toString()
  );
  $(".powerUsageTodayCabin").html(
    Math.round(powerData.cabin.usageToday).toString()
  );
  $(".powerCostTodayHome").html(
    Math.round(powerData.home.costToday).toString()
  );
  $(".powerCostTodayCabin").html(
    Math.round(powerData.cabin.costToday).toString()
  );
  if (homey.tempOut && homey.age && homey.age < 60) {
    const t = Number(homey.tempOut).toFixed(1);
    $(".current_temperature").html(`${t}&deg;`);
  } else {
    $(".current_temperature").html(`?`);
  }
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
 * Reload weather_graph_svg image every ten minutes
 */
function updateWeatherGraph() {
  const img = $("#weather_graph_svg");
  if (img) {
    const date = new Date();
    img.attr("src", img.attr("src").split("?")[0] + "?" + date.getTime());
  }
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
