export interface PowerStatusForPlace {
    power: number;
    day: {
        accumulatedConsumption: number;
        accumulatedProduction: number;
        accumulatedCost: number;
    };
    month: {
        accumulatedConsumption: number;
        accumulatedProduction: number;
        accumulatedCost: number;
    };
    minPower: number;
    averagePower: number;
    maxPower: number;
    accumulatedReward: number;
    powerProduction: number;
    minPowerProduction: number;
    maxPowerProduction: number;
    usageForDay: UsageForDay;
    prices: PowerPriceDay;
    currentPrice: PowerPrice;
    usageForTodayLastHourSeen: number;
    usageForTodayUpToThisHour: number;
}
export interface UsageForDay {
    [key: number]: {
        consumption: number;
        production: number;
        total: number;
        price: number;
    };
}

export interface PowerPriceDay {
    [key: number]: PowerPrice;
}

export interface PowerPrice {
    energy: number;
    tax: number;
    transportCost: number;
    energyAfterSupport: number;
    totalAfterSupport: number;
}

export interface PowerStatus {
    home: PowerStatusForPlace;
    cabin: PowerStatusForPlace;
}
