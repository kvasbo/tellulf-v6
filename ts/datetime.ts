declare const okular: any;

interface timeData {
  time: string;
  date: string;
}

$(function () {
  // Init time update
  updateTime();
  updateBattery();
  window.setInterval(function () {
    updateTime();
  }, 5000);
});

function updateBattery() {
  try {
    if (okular && okular.DevicesStatus) {
      const status = okular.DevicesStatus();
      const battery = status["28003d00-0f47-3830-3933-303600000000"]["Battery"];
      $(".battery").html(`${battery}%`);
    }
  } catch (e) {}
}

// Update time, and set itself to re-update on the start of next minute.
async function updateTime() {
  const timeData = await jQuery.get("/time");
  $("#now_time").html(timeData.time);
  $("#now_date").html(timeData.date);
}
