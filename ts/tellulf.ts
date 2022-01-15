declare const okular: any;

interface TimeData {
  time: string;
  date: string;
}

interface PowerData {
  usageToday: number;
  costToday: number;
}

interface PowerInfoSet {
  cabin: PowerData;
  home: PowerData;
}

interface FactSet {
  fact: string;
  category: string;
  subcategory: string;
}

$(function () {
  // Init time update
  updateTime();
  updateBattery();
  updatePowerUsage();
  updateFact();
  window.setInterval(function () {
    updateTime();
  }, 5000);
  window.setInterval(function () {
    updatePowerUsage();
  }, 60000);
});

// Update time from the server
function updateTime() {
  jQuery.get("/time").then((timeData: TimeData) => {
    $("#now_time").html(timeData.time);
    $("#now_date").html(timeData.date);
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

/**
 * Live update power usage.
 */
function updateFact() {
  jQuery.get("/fact").then((d: FactSet) => {
    $(".fact-title").html(`${d.category} - ${d.subcategory}`);
    $(".fact-text").html(`${d.fact}`);
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
