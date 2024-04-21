import { DateTime, Settings } from "luxon";
import {
  TimeSeries,
  YrCompleteResponseSchema,
  LongTermForecastSchema,
  LongTermForecastDay,
  CurrentWeather,
  DailyForecasts,
  DailyForecast,
  HourlyForecast,
} from "./types.met";

const YR_URL_FORECAST =
  "https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=59.9508&lon=10.6848";
const YR_URL_FORECAST_LONG =
  "https://api.met.no/weatherapi/subseasonal/1.0/complete?lat=59.9508&lon=10.6848";

// Configure the time zone
Settings.defaultZone = "Europe/Oslo";

/**
 * Weather data from Yr
 */
export class Weather {
  public forecast: TimeSeries[] = [];
  public longTermForecast: LongTermForecastDay[] = [];

  // Common options for fetch
  private fetchOptions = {
    method: "GET",
    headers: {
      "User-Agent": "tellulf v6: audun@kvasbo.no",
    },
  };

  constructor() {
    setTimeout(() => {
      this.updateForecasts();
    }, 1000 * 1);
    setInterval(
      () => {
        this.updateForecasts();
      },
      30 * 60 * 1000,
    ); // Every 30 minutes
  }

  private async updateForecasts(): Promise<void> {
    // Fetch forecast
    this.fetchForecastData();
    this.fetchLongTermForecast();
  }

  public getCurrentWeather(): CurrentWeather {
    const out = {
      temperature: 999,
      symbol: "blank",
    };

    if (this.forecast[0]) {
      out.temperature = this.forecast[0]?.data?.instant?.details
        ?.air_temperature
        ? this.forecast[0]?.data.instant.details.air_temperature
        : 999;
      out.symbol = this.forecast[0]?.data?.next_1_hours?.summary?.symbol_code
        ? this.forecast[0].data.next_1_hours.summary.symbol_code
        : "blank";
    }

    return out;
  }

  /**
   * Get the daily forecasts
   * @returns DailyForecasts
   */
  public getDailyForecasts(): DailyForecasts {
    const dayForecasts: DailyForecasts = {};
    for (const series of this.longTermForecast) {
      const time = new Date(series.time);
      const date = time.toISOString().slice(0, 10);
      let symbol = "blank";
      // Define the symbol based on the data for precipitation
      if (
        series.data.next_24_hours.details.probability_of_heavy_precipitation >
        50
      ) {
        symbol =
          series.data.next_24_hours.details.probability_of_frost > 50
            ? "heavysnow"
            : "heavyrain";
      } else if (
        series.data.next_24_hours.details.probability_of_precipitation > 50
      ) {
        symbol =
          series.data.next_24_hours.details.probability_of_frost > 50
            ? "snow"
            : "rain";
      }

      dayForecasts[date] = {
        minTemp: series.data.next_24_hours.details.air_temperature_min,
        maxTemp: series.data.next_24_hours.details.air_temperature_max,
        meanTemp: series.data.next_24_hours.details.air_temperature_mean,
        lightRainProbability: Math.round(series.data.next_24_hours.details.probability_of_precipitation),
        heavyRainProbability: Math.round(series.data.next_24_hours.details.probability_of_heavy_precipitation),
        symbol,
      } as DailyForecast;
    }

    return dayForecasts;
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
   * Fetch the long term forecast
   * @returns LongTermForecast
   */
  public async fetchLongTermForecast(): Promise<void> {
    const forecast = await fetch(YR_URL_FORECAST_LONG, this.fetchOptions);

    if (forecast.ok) {
      const forecastJson = await forecast.json();
      const forecastValidated = LongTermForecastSchema.safeParse(forecastJson);
      if (forecastValidated.success) {
        console.log("Long term forecast validated, let's go!");
        console.log(
          "Number of long term days",
          forecastValidated.data.properties.timeseries.length,
        );
        this.longTermForecast = forecastValidated.data.properties
          .timeseries as LongTermForecastDay[];
      } else {
        console.log("Could not validate long term forecast");
      }
    }
  }

  /**
   * Do the fetching from Met api
   * @param url
   * @returns
   */
  private async fetchForecastData(): Promise<void> {
    try {
      // Fetch and decode JSON
      console.log("Fetching forecast from yr.no", YR_URL_FORECAST);
      const fetchResponse = await fetch(YR_URL_FORECAST, this.fetchOptions);

      if (!fetchResponse.ok) {
        // Log the fetch error message
        console.log(fetchResponse.statusText);
        console.error("Could not fetch forecast from yr.no");
        setTimeout(() => {
          this.fetchForecastData();
        }, 1000 * 10);
        return;
      }

      const forecast = await fetchResponse.json();

      // Validate the response
      const forecastValidated = YrCompleteResponseSchema.safeParse(forecast);

      if (forecastValidated.success) {
        console.log("Forecast validated, let's go!");
        console.log(
          "Number of forecasts",
          forecastValidated.data.properties.timeseries.length,
        );
        this.forecast = forecastValidated.data.properties.timeseries;
        return;
      } else {
        console.log("Could not validate forecast");
        console.log(forecastValidated);
        setTimeout(() => {
          this.fetchForecastData();
        }, 1000 * 10);
      }
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        this.fetchForecastData();
      }, 1000 * 10);
      return;
    }
  }
}
