import * as dotenv from 'dotenv';
import * as z from 'zod';
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

// 1 - Skjema definisjon
const CurrentWeatherSchema = z.object({
    symbol: z.string(),
    temperature: z.number(),
});

const DailyForecastSchema = z.object({
    maxTemp: z.number(),
    minTemp: z.number(),
    symbol: z.string().optional(),
});

export interface HourlyForecast {
    symbol: string;
    details: next_1_hours['details'];
    instant: instant['details'];
    hour: string;
}

export type DailyForecast = z.infer<typeof DailyForecastSchema>;

export interface DailyForecasts {
    [key: string]: DailyForecast;
}

export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;

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

    private updateForecasts(): void {
        // Fetch forecast
        Weather.fetchForecastData(yrUrlForecast, YrCompleteResponseSchema).then(
            (forecast) => {
                this.forecast = forecast;
                console.log('Forecast fetched');
            }
        );
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

            if (date === today) {
                continue;
            }

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

            if (series.time.includes('T06:00:00')) {
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
    private static async fetchForecastData(
        url: string,
        testSchema: z.ZodSchema
    ): Promise<TimeSeries[]> {
        // Fetch and decode JSON
        const response = await axios.get(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'tellulf v6: audun@kvasbo.no',
            },
        });
        const forecast = response.data;

        // Validate the response
        const forecastValidated = testSchema.safeParse(forecast);

        if (forecastValidated.success) {
            return forecastValidated.data.properties.timeseries as TimeSeries[];
        } else {
            console.log('Could not validate forecast');
            console.log(forecastValidated.error.issues);
            return forecast.properties.timeseries as TimeSeries[];
        }
    }
}
