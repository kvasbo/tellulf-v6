$(function () {
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
function updateTime() {
    jQuery.get("/time").then((timeData) => {
        $("#now_time").html(timeData.time);
        $("#now_date").html(timeData.date);
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
function updateFact() {
    jQuery.get("/fact").then((d) => {
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
    }
    catch (e) { }
}
