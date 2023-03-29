require('dotenv').config();

import axios from 'axios';
import { DateTime, Settings } from "luxon";

// Configure the time zone
Settings.defaultZone = "Europe/Oslo";

const yrUrlForecast: string = process.env.YR_URL_FORECAST ? process.env.YR_URL_FORECAST.toString() : "";
const yrUrlNowcast: string = process.env.YR_URL_NOWCAST ? process.env.YR_URL_NOWCAST.toString() : "";

export interface HourlyForecast {
  symbol: string;
  details: any;
  instant: any;
  hour: string;
}

type TimeSeries = {
  time: string;
  data: {
      instant: { details: { air_temperature: number } };
      next_1_hours: {
          summary: { symbol_code: string };
          details?: any;
      };
      next_6_hours: {
          summary: { symbol_code: string };
          details: { air_temperature_min: number; air_temperature_max: number };
      };
      next_12_hours: { summary: { symbol_code: string } };
  };
};

/**
 * Weather data from Yr
 */
export class Weather {

  public forecast: TimeSeries[] = [];
  public nowcast: TimeSeries[] = [];

  constructor() {
    this.updateForecasts();
    setInterval(() => {
      this.updateForecasts();
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  private updateForecasts() {
    // Fetch forecast
    Weather.fetchForecastData(yrUrlForecast).then((forecast) => {
      this.forecast = forecast;
      console.log("Forecast fetched");
    });
    // Fetch nowcast
    Weather.fetchForecastData(yrUrlNowcast).then((forecast) => {
      this.nowcast = forecast;
      console.log("Nowcast fetched");
    });
  }

  public getCurrentWeather(): { temperature: number; symbol: string } {
    const temp = {
        temperature: this.nowcast[0].data.instant.details.air_temperature,
        symbol: this.nowcast[0].data.next_1_hours.summary?.symbol_code,
    };

    // Fix strange edge case
    if (temp.temperature > -1 && temp.temperature < 1) {
        temp.temperature = 0;
    }

    return temp;
  } 

  public getDailyForecasts(): { [key: string]: { maxTemp: number; minTemp: number; symbol?: string } } {
    const out: { [key: string]: { maxTemp: number; minTemp: number; symbol?: string } } = {};
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

        if (series.time.includes("T06:00:00")) {
            out[date].symbol = series.data.next_12_hours?.summary.symbol_code;
        }
    }
    return out;
}

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
    const forecast =response.data;
    return forecast?.properties?.timeseries;
  }
}