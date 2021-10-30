$(function () {
    updateTime();
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
/**
Update time, and set itself to re-update on the start of next minute.
*/
function updateTime() {
    const time = new Date();
    $("#now_time").html(formatTime(time));
    $("#now_date").html(formatDate(time, true));
}
function formatDate(d, withMonth = false) {
    const date = d.getDate();
    const wDay = days[d.getDay()];
    const month = months[d.getMonth()];
    if (withMonth) {
        return `${wDay} ${date}. ${month}`;
    }
    else {
        return `${wDay} ${date}.`;
    }
}
function formatTime(d) {
    const h = d.getHours();
    const m = d.getMinutes();
    let mS = m.toString();
    if (m < 10) {
        mS = `0${m.toString()}`;
    }
    return `${h}:${mS}`;
}
