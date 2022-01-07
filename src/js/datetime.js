$(function () {
    updateTime();
    updateBattery();
    window.setInterval(function () {
        updateTime();
    }, 5000);
});
function updateTime() {
    jQuery.get("/time").then((timeData) => {
        $("#now_time").html(timeData.time);
        $("#now_date").html(timeData.date);
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
