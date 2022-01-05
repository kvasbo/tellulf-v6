$(function () {
    updateTime();
    updateBattery();
});
var months = [
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
var days = [
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
            var status_1 = okular.DevicesStatus();
            var battery = status_1["28003d00-0f47-3830-3933-303600000000"]["Battery"];
            $(".battery").html(battery + "%");
        }
    }
    catch (e) {
    }
}
function updateTime() {
    var oslo_datetime_str = new Date().toLocaleString("en-US", {
        timeZone: "Europe/Oslo",
    });
    var date_oslo = new Date(oslo_datetime_str);
    $("#now_time").html(formatTime(date_oslo));
    $("#now_date").html(formatDate(date_oslo, true));
    var nextMinute = new Date();
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    nextMinute.setSeconds(0);
    var diff = nextMinute.getTime() - new Date().getTime();
    setTimeout(function () {
        updateTime();
    }, diff);
}
function formatDate(d, withMonth) {
    if (withMonth === void 0) { withMonth = false; }
    var date = d.getDate();
    var wDay = days[d.getDay()];
    var month = months[d.getMonth()];
    if (withMonth) {
        return wDay + " " + date + ". " + month;
    }
    else {
        return wDay + " " + date + ".";
    }
}
function formatTime(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var mS = m.toString();
    if (m < 10) {
        mS = "0" + m.toString();
    }
    return h + ":" + mS;
}
