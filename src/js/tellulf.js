var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
$(function () {
    setReload(1);
    runUpdateLoop(true);
    window.setInterval(function () {
        runUpdateLoop();
    }, 15000);
});
function runUpdateLoop(force) {
    if (force === void 0) { force = false; }
    return __awaiter(this, void 0, void 0, function () {
        var calls, data, timeData, homey, entur, minutes, enturHtml, i, t, p, p, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    calls = [
                        jQuery.get("/time"),
                        jQuery.get("/homey"),
                        jQuery.get("/entur"),
                    ];
                    return [4, Promise.all(calls)];
                case 1:
                    data = _a.sent();
                    timeData = data[0];
                    homey = data[1];
                    entur = data[2];
                    minutes = new Date().getMinutes();
                    if (minutes % 10 === 0 || force) {
                        updateWeatherGraph();
                        updateBattery();
                    }
                    entur.forEach(function (tur) {
                        var time = new Date(tur.time);
                    });
                    $("#now_time").html(timeData.time);
                    $("#now_date").html(timeData.date);
                    $("#now_week").html("Uke ".concat(timeData.week));
                    enturHtml = "Neste to baner: ";
                    for (i = 0; i < Math.min(entur.length, 2); i++) {
                        enturHtml += "<span class=\"entur_item\">".concat(entur[i].time.substring(11, 16), "</span>");
                    }
                    $(".bane").html(enturHtml);
                    if (true || homey.age && homey.age < 600) {
                        if (homey.tempOut) {
                            t = Number(homey.tempOut).toFixed(1);
                            $(".current_temperature").html("".concat(t, "&deg;"));
                        }
                        else {
                            $(".current_temperature").html("?");
                        }
                        if (homey.pressure) {
                            p = Number(homey.pressure).toFixed(0);
                            $(".current_pressure").html("".concat(p, " hPa"));
                        }
                        if (homey.humOut) {
                            p = Number(homey.humOut).toFixed(0);
                            $(".current_humidity").html("".concat(p, " % hum"));
                        }
                        if (homey.power) {
                            p = Math.round(Number(homey.power) / 100) / 10;
                            $(".current_power").html("".concat(p, " kW"));
                        }
                        if (homey.powerUsedToday) {
                            $(".powerUsageTodayHome").html(Math.round(Number(homey.powerUsedToday)).toString());
                        }
                    }
                    return [2];
            }
        });
    });
}
function updateBattery() {
}
function updateWeatherGraph() {
    var img = $("#weather_graph_svg");
    if (img) {
        var date = new Date();
        img.attr("src", img.attr("src").split("?")[0] + "?" + date.getTime());
    }
}
function setReload(inHours) {
    var now = new Date();
    var startOfNextHour = new Date();
    startOfNextHour.setUTCHours(now.getUTCHours() + inHours, 0, 1, 0);
    var diff = startOfNextHour.getTime() - now.getTime();
    setTimeout(function () { return window.location.reload(); }, diff);
}
