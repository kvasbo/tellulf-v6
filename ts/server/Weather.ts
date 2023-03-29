require('dotenv').config();

import axios from 'axios';

const yrUrlForecast: string = process.env.YR_URL_FORECAST ? process.env.YR_URL_FORECAST.toString() : "";
const yrUrlNowcast: string = process.env.YR_URL_NOWCAST ? process.env.YR_URL_NOWCAST.toString() : "";

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
    // Fetch forecast
    Weather.fetchForecastData(yrUrlForecast).then((forecast) => {
      this.forecast = forecast;
    });
    // Fetch nowcast
    Weather.fetchForecastData(yrUrlNowcast).then((forecast) => {
      this.nowcast = forecast;
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

  public getHourlyForecasts(): Record<string, { symbol: string; details: any; instant: any; hour: number }> {
    const out: Record<string, { symbol: string; details: any; instant: any; hour: number }> = {};
    for (const series of this.forecast) {
        if (series.data.next_1_hours.details) {
            const time = new Date(series.time).getTime();
            const date = new Date(time).toISOString().slice(0, 13).replace('T', '-');
            const date_data = new Date(time);

            out[date] = {
                symbol: series.data.next_1_hours.summary?.symbol_code,
                details: series.data.next_1_hours.details,
                instant: series.data.instant.details,
                hour: date_data.getUTCHours(),
            };
        } else {
            break;
        }
    }
    return out;
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

        const t = series.data.instant.details.air_temperature ? series.data.instant.details.air_temperature : -9999;

        if (t) {
            if (out[date].maxTemp < t) {
                out[date].maxTemp = t;
            }
            if (out[date].minTemp > t) {
                out[date].minTemp = t;
            }
        }

        if (series.time.includes("T06:00:00")) {
            out[date].symbol = series.data.next_12_hours.summary?.symbol_code;
        }
    }

    return out;
}

  public getSixHourForecasts(): Record<string, any> {
    const _return: Record<string, any> = {};
    for (const series of this.forecast) {
        const utc_hour = parseInt(series.time.slice(11, 13), 10);
        const time = new Date(series.time).getTime();
        const date = new Date(time).toISOString().slice(0, 10);
        const date_data = new Date(time);

        if (utc_hour % 6 === 0 && series.data?.next_6_hours?.details) {
            if (!_return[date]) {
                _return[date] = {};
            }

            const temps = [series.data.next_6_hours.details.air_temperature_min, series.data.next_6_hours.details.air_temperature_max];
            const abs = temps.map((d) => Math.abs(d));
            const maxVal = Math.max(...abs);
            const maxKey = abs.indexOf(maxVal);

            const temperature = temps[maxKey];

            _return[date][date_data.getUTCHours()] = {
                symbol: series.data.next_6_hours.summary?.symbol_code,
                details: series.data.next_6_hours.details,
                hour: date_data.getUTCHours(),
                temperature: temperature,
            };
        }
    }
    return _return;
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