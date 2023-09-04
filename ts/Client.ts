/* eslint-disable no-undef */
/**
 * This file is the client side of the dashboard. It is not run on the server, but served as is to the client.
 */

type Train = {
    time: string;
    destination: string;
};

type HomeyData = {
    tempOut?: number;
    humOut?: number;
    power?: number;
    pressure?: number;
    powerUsedToday?: number;
    costToday?: number;
    powerCostNow?: number;
    tempIn?: number;
    humIn?: number;
    co2in?: number;
    niceTime?: string;
    powerUsedTodayCabin?: number;
    powerCabin?: number;
    costTodayCabin?: number;
    coolerRoomTemp: number;
    coolerRoomHumidity: number;
    coolerRoomBattery: number;
};

type TimeData = {
    time: string;
    date: string;
    week: string;
};

let lastUpdatedPower = new Date();

// Reload the page every fifteen seconds
$(function () {
    setReloadClient(1);
    // Run the update loop immediately
    runUpdateLoop();
    // Run the update loop every ten seconds
    window.setInterval(function () {
        runUpdateLoop();
    }, 10000);
});

// Run the update loop
async function runUpdateLoop() {
    const getTime = fetch('/time');
    const getHomey = fetch('/homey');
    const getEntur = fetch('/entur');

    const calls = [getTime, getHomey, getEntur];

    // Wait for all of them to return
    const data = await Promise.all(calls);

    // Unwrap the returned data (this is why the order is important)
    const timeData: TimeData = await data[0].json();
    updateTimeInfo(timeData);

    const entur: Train[] = await data[2].json();
    updateEnturInfo(entur);

    const homey: HomeyData = await data[1].json();

    // Show temperature
    if (homey.tempOut) {
        const t = Number(homey.tempOut).toFixed(0);
        $('.current_temperature').html(`${t}&deg;`);
    } else {
        $('.current_temperature').html(`?`);
    }

    // Show pressure
    if (homey.pressure) {
        const p = Number(homey.pressure).toFixed(0);
        $('.current_pressure').html(`${p} hPa`);
    }

    // Show humidity
    if (homey.humOut) {
        const p = Number(homey.humOut).toFixed(0);
        $('.current_humidity').html(`${p} % hum`);
    }

    if (homey.power) {
        setLastUpdatedPowerTime();
        const p = Math.round(Number(homey.power) / 100) / 10;
        $('.current_power').html(`${p} kW`);
    }
    if (homey.powerUsedToday) {
        $('.powerUsageTodayHome').html(
            Math.round(Number(homey.powerUsedToday)).toString()
        );
    }
    if (homey.powerCostNow) {
        const currentPowePrice = +homey.powerCostNow;
        $('.current_price').html(`${currentPowePrice.toFixed(2)} kr/kWh`);
    }
    if (homey.costToday) {
        const costToday = +homey.costToday;
        $('.powerCostTodayHome').html(`${costToday.toFixed(0)}`);
    }
    if (homey.powerUsedTodayCabin) {
        $('.powerUsageTodayCabin').html(
            Math.round(Number(homey.powerUsedTodayCabin)).toString()
        );
    }
    if (homey.powerCabin !== undefined) {
        const p = Math.round(Number(homey.powerCabin) / 100) / 10;
        $('.currentPowerCabin').html(`${p} kW`);
    }
    if (homey.costTodayCabin !== undefined) {
        const costToday = +homey.costTodayCabin;
        $('.powerCostTodayCabin').html(`${costToday.toFixed(0)}`);
    }
    if (homey.coolerRoomTemp !== null) {
        const coolerTemp = homey.coolerRoomTemp;
        $('.coolerTemp').html(coolerTemp.toString());
    }
    if (homey.coolerRoomHumidity !== null) {
        const coolerHum = homey.coolerRoomHumidity;
        $('.coolerHumidity').html(coolerHum.toString());
    }

    // Remove power data if not updated lately
    checkLastUpdatedPowerTime();
}

function setLastUpdatedPowerTime() {
    lastUpdatedPower = new Date();
}

function checkLastUpdatedPowerTime() {
    const now = new Date();
    const diff = now.getTime() - lastUpdatedPower.getTime();
    const diffMinutes = Math.round(diff / 1000 / 60);

    if (diffMinutes > 1) {
        $('.current_power').html(`?`);
        $('.current_price').html(`?`);
        $('.powerUsageTodayHome').html(`?`);
        $('.powerCostTodayHome').html(`?`);
    }
}

function updateTimeInfo(timeData: TimeData) {
    // Update all the interfaces at once
    $('#now_time').html(timeData.time);
    $('#now_date').html(timeData.date);
    $('#now_week').html(`Uke ${timeData.week}`);
}

function updateEnturInfo(entur: Train[]) {
    let enturHtml = '<strong>Neste baner:</strong>';

    for (let i = 0; i < Math.min(entur.length, 4); i++) {
        enturHtml += `<span class="entur_item">${entur[i].time.substring(
            11,
            16
        )}</span>`;
    }

    $('.bane').html(enturHtml);
}

/**
 * Reload at the start of the hour.
 */
function setReloadClient(inHours: number) {
    const now = new Date();
    const startOfNextHour = new Date();
    startOfNextHour.setUTCHours(now.getUTCHours() + inHours, 0, 1, 0);
    const diff = startOfNextHour.getTime() - now.getTime();
    setTimeout(() => window.location.reload(), diff);
}