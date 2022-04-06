$(function () {
    updateTime();
    updateBattery();
    updatePowerUsage();
    updateHomey();
    setReload();
    updateWeatherGraphEveryTenMinutes();
    window.setInterval(function () {
        updateTime();
    }, 10000);
    window.setInterval(function () {
        updatePowerUsage();
        updateHomey();
    }, 60000);
});
function updateTime() {
    jQuery.get("/time").then((timeData) => {
        $("#now_time").html(timeData.time);
        $("#now_date").html(timeData.date);
        $("#now_week").html(`Uke ${timeData.week}`);
    });
}
function updatePowerUsage() {
    jQuery.get("/tibber").then((d) => {
        $(".powerUsageTodayHome").html(Math.round(d.home.usageToday).toString());
        $(".powerUsageTodayCabin").html(Math.round(d.cabin.usageToday).toString());
        $(".powerCostTodayHome").html(Math.round(d.home.costToday).toString());
        $(".powerCostTodayCabin").html(Math.round(d.cabin.costToday).toString());
    });
}
function updateHomey() {
    jQuery.get("/homey").then((d) => {
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
    }
    catch (e) { }
}
function updateWeatherGraphEveryTenMinutes() {
    const interval = 600000;
    setTimeout(() => {
        const img = $("#weather_graph_svg");
        if (img) {
            const date = new Date();
            img.attr("src", img.attr("src").split("?")[0] + "?" + date.getTime());
        }
        updateWeatherGraphEveryTenMinutes();
    }, interval);
}
function setReload() {
    const now = new Date();
    const startOfNextHour = new Date();
    startOfNextHour.setUTCHours(now.getUTCHours() + 1, 0, 1, 0);
    const diff = startOfNextHour.getTime() - now.getTime();
    setTimeout(() => window.location.reload(), diff);
}
