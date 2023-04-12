import * as dotenv from 'dotenv';
import axios from 'axios';
import { DateTime, Settings } from 'luxon';
import {
    TimeSeries,
    next_1_hours,
    instant,
    YrCompleteResponseSchema,
} from './types.met';

dotenv.config();

// Configure the time zone
Settings.defaultZone = 'Europe/Oslo';

const yrUrlForecast: string = process.env.YR_URL_FORECAST
    ? process.env.YR_URL_FORECAST.toString()
    : '';

interface HourlyForecast {
    symbol: string;
    details: next_1_hours['details'];
    instant: instant['details'];
    hour: string;
}

export type DailyForecast = {
    maxTemp: number;
    minTemp: number;
    symbol?: string;
};

interface DailyForecasts {
    [key: string]: DailyForecast;
}

type CurrentWeather = {
    symbol: string;
    temperature: number;
};

/**
 * Weather data from Yr
 */
export class Weather {
    public forecast: TimeSeries[] = [];

    constructor() {
        this.updateForecasts();
        setInterval(() => {
            this.updateForecasts();
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    private async updateForecasts(): Promise<void> {
        // Fetch forecast
        this.forecast = await Weather.fetchForecastData(yrUrlForecast);
    }

    public getCurrentWeather(): CurrentWeather {
        const temp: CurrentWeather = {
            temperature: this.forecast[0].data.instant.details.air_temperature
                ? this.forecast[0].data.instant.details.air_temperature
                : 999,
            symbol: this.forecast[0].data.next_1_hours?.summary?.symbol_code
                ? this.forecast[0].data.next_1_hours.summary.symbol_code
                : 'unknown',
        };

        // Fix strange edge case
        if (temp.temperature > -1 && temp.temperature < 1) {
            temp.temperature = 0;
        }

        return temp;
    }

    public getDailyForecasts(): DailyForecasts {
        const out: DailyForecasts = {};
        const today = new Date().toISOString().slice(0, 10);

        for (const series of this.forecast) {
            const time = new Date(series.time);
            const date = time.toISOString().slice(0, 10);

            if (!out[date]) {
                out[date] = {
                    maxTemp: -9999,
                    minTemp: 9999,
                };
            }

            if (series.data.instant?.details?.air_temperature) {
                const t = series.data.instant.details.air_temperature;
                if (out[date].maxTemp < t) {
                    out[date].maxTemp = t;
                }
                if (out[date].minTemp > t) {
                    out[date].minTemp = t;
                }
            }

            // Either 0600 or empty and today (to handle running after the 0600 one is gone)
            if (
                series.time.includes('T06:00:00') ||
                (!out[date].symbol && date === today)
            ) {
                out[date].symbol =
                    series.data.next_12_hours?.summary.symbol_code;
            }
        }
        return out;
    }

    /**
     * Get the hourly forecasts
     * @returns HourlyForecast[]
     */
    public getHourlyForecasts(): HourlyForecast[] {
        const out: HourlyForecast[] = [];

        this.forecast.forEach((series) => {
            if (series.data?.next_1_hours?.details) {
                const dt = DateTime.fromISO(series.time);

                out.push({
                    symbol: series.data.next_1_hours.summary?.symbol_code,
                    details: series.data.next_1_hours.details,
                    instant: series.data.instant.details,
                    hour: dt.hour.toString(),
                });
            }
        });
        return out;
    }

    /**
     * Do the fetching from Met api
     * @param url
     * @returns
     */
    private static async fetchForecastData(url: string): Promise<TimeSeries[]> {
        // Fetch and decode JSON
        const response = await axios.get(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'tellulf v6: audun@kvasbo.no',
            },
        });
        const forecast = response.data;

        // Validate the response
        const forecastValidated = YrCompleteResponseSchema.safeParse(forecast);

        if (forecastValidated.success) {
            console.log("Forecast validated, let's go!");
            return forecastValidated.data.properties.timeseries as TimeSeries[];
        } else {
            console.log(
                'Could not validate forecast due to the following issues:'
            );
            console.log(forecastValidated.error.issues);
            return [] as TimeSeries[];
        }
    }
}
