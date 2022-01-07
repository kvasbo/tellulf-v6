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
    }
    catch (e) { }
}
function updateTime() {
    return __awaiter(this, void 0, void 0, function* () {
        const timeData = yield jQuery.get("/time");
        $("#now_time").html(timeData.time);
        $("#now_date").html(timeData.date);
    });
}
