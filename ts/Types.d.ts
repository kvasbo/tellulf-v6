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
    [key: number]: {
        energy: number;
        tax: number;
        total: number;
        transportCost: number;
        energyAfterSupport: number;
    };
}

export interface PowerStatus {
    home: PowerStatusForPlace;
    cabin: PowerStatusForPlace;
}
