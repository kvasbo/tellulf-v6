require('dotenv').config();

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
      console.log(forecast);
      this.nowcast = forecast;
    });
  }

  private static async fetchForecastData(url: string): Promise<TimeSeries[]> {
    
    // Fetch and decode JSON
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'tellulf v6: audun@kvasbo.no',
        },
    });
    const forecast = await response.json() as any;

    return forecast?.properties?.timeseries;
  }
}