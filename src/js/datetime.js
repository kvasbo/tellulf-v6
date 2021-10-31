$(function () {
    updateTime();
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
function updateTime() {
    var time = new Date();
    $("#now_time").html(formatTime(time));
    $("#now_date").html(formatDate(time, true));
    var nextMinute = new Date();
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    nextMinute.setSeconds(0);
    var diff = nextMinute.getTime() - new Date().getTime();
    setTimeout(function () { updateTime(); }, diff);
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
