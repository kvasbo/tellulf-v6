declare const okular: any;

$(function () {
  // Init time update
  updateTime();
  updateBattery();
});

const months = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juni",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

const days = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

function updateBattery() {
  try {
    if (okular && okular.DevicesStatus) {
      const status = okular.DevicesStatus();
      const battery = status["28003d00-0f47-3830-3933-303600000000"]["Battery"];
      $(".battery").html(`${battery}%`);
    }
  } catch (e) {
    // console.log(e);
  }
}

// Update time, and set itself to re-update on the start of next minute.
function updateTime() {
  // Make sure we get Oslo time
  const oslo_datetime_str = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Oslo",
  });
  const date_oslo = new Date(oslo_datetime_str);

  $("#now_time").html(formatTime(date_oslo));
  $("#now_date").html(formatDate(date_oslo, true));

  // Pure JS
  const nextMinute = new Date();
  nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  nextMinute.setSeconds(0);

  const diff = nextMinute.getTime() - new Date().getTime();

  setTimeout(function () {
    updateTime();
  }, diff);
}

// Just format a date
function formatDate(d: Date, withMonth: boolean = false) {
  const date = d.getDate();
  const wDay = days[d.getDay()];
  const month = months[d.getMonth()];

  if (withMonth) {
    return `${wDay} ${date}. ${month}`;
  } else {
    return `${wDay} ${date}.`;
  }
}

function formatTime(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  let mS = m.toString();
  if (m < 10) {
    mS = `0${m.toString()}`;
  }
  return `${h}:${mS}`;
}
