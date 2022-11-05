var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
$(function () {
    setReload(1);
    runUpdateLoop(true);
    window.setInterval(function () {
        runUpdateLoop();
    }, 15000);
});
function runUpdateLoop(force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const calls = [
            jQuery.get("/time"),
            jQuery.get("/homey"),
            jQuery.get("/entur"),
        ];
        const data = yield Promise.all(calls);
        const timeData = data[0];
        const homey = data[1];
        const entur = data[2];
        const minutes = new Date().getMinutes();
        if (minutes % 10 === 0 || force) {
            updateWeatherGraph();
            updateBattery();
            updatePowerprices();
        }
        entur.forEach((tur) => {
            const time = new Date(tur.time);
        });
        $("#now_time").html(timeData.time);
        $("#now_date").html(timeData.date);
        $("#now_week").html(`Uke ${timeData.week}`);
        let enturHtml = "Neste to baner: ";
        for (let i = 0; i < Math.min(entur.length, 2); i++) {
            enturHtml += `<span class="entur_item">${entur[i].time.substring(11, 16)}</span>`;
        }
        $(".bane").html(enturHtml);
        if (true || homey.age && homey.age < 600) {
            if (homey.tempOut) {
                const t = Number(homey.tempOut).toFixed(1);
                $(".current_temperature").html(`${t}&deg;`);
            }
            else {
                $(".current_temperature").html(`?`);
            }
            if (homey.pressure) {
                const p = Number(homey.pressure).toFixed(0);
                $(".current_pressure").html(`${p} hPa`);
            }
            if (homey.humOut) {
                const p = Number(homey.humOut).toFixed(0);
                $(".current_humidity").html(`${p} % hum`);
            }
            if (homey.power) {
                const p = Math.round(Number(homey.power) / 100) / 10;
                $(".current_power").html(`${p} kW`);
            }
            if (homey.powerUsedToday) {
                $(".powerUsageTodayHome").html(Math.round(Number(homey.powerUsedToday)).toString());
            }
        }
    });
}
function updateBattery() {
}
function updatePowerprices() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const prices = yield jQuery.get("/powerprices");
        if (prices.now) {
            const price = prices.now;
            $(".current_price").html(`${price.NOK_per_kWh.toFixed(2)} kr/kWh`);
        }
        ;
    });
}
function updateWeatherGraph() {
    const img = $("#weather_graph_svg");
    if (img) {
        const date = new Date();
        img.attr("src", img.attr("src").split("?")[0] + "?" + date.getTime());
    }
}
function setReload(inHours) {
    const now = new Date();
    const startOfNextHour = new Date();
    startOfNextHour.setUTCHours(now.getUTCHours() + inHours, 0, 1, 0);
    const diff = startOfNextHour.getTime() - now.getTime();
    setTimeout(() => window.location.reload(), diff);
}
