import { Weather } from './Weather';
import { Calendar } from './Calendar';
import { Clock } from './Clock';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import { DateTime } from 'luxon';

export class Days {

  public weather;
  private calendar; 

  constructor() {
    this.weather = new Weather();
    this.calendar = new Calendar();
  }

  public generateComingDays(numberOfDays: number = 10) {
    const days: any = [];
    for (let i = 0; i < numberOfDays; i++) {
      const dt = DateTime.now().plus({ days: i });
      days.push(this.getDataForDate(new Date(new Date().setDate(new Date().getDate() + i))));
    }
    return days;
  }

  public GenerateToday(): any {
    return this.getDataForDate();
  }

  private getDataForDate(jsDate: Date = new Date()): {
    isoDate: string
    date: string;
    weekday: string;
    forecast: any;
    daily_forecast: any;
    events: any;
    birthdays: any;
    sunrise: string;
    sunset: string;
} {
    // Create a Luxon DateTime object
    const dt = DateTime.fromJSDate(jsDate).setLocale('nb');

    const date = dt.toISODate();

    const sunRiseDate = getSunrise(59.9139, 10.7522, jsDate);
    const sunSetDate = getSunset(59.9139, 10.7522, jsDate);

    const forecast = []; //this.weather.getSixHourForecasts();
    const daily = this.weather.getDailyForecasts();

    return {
        isoDate: date,
        date: Days.createNiceDate(jsDate),
        weekday: Days.createNiceDate(jsDate, true),
        forecast: [], //forecast[date] ? forecast[date] : {},
        daily_forecast: daily[date] ? daily[date] : {},
        events: this.calendar.getEvents(jsDate),
        birthdays: this.calendar.getBirthdays(jsDate),
        sunrise: DateTime.fromJSDate(sunRiseDate).setLocale("nb").toFormat("HH:mm"),
        sunset: DateTime.fromJSDate(sunSetDate).setLocale("nb").toFormat("HH:mm"), 
    };
}


  /** 
   * Nicely format a date
   * To be switched to using Luxon 
   */
  private static createNiceDate(jsDate: Date, relative = false): string {
    const dt = DateTime.fromJSDate(jsDate).setLocale('nb').startOf("day");
    if (relative) {
        if (dt.hasSame(DateTime.local(), "day")) {
            return "i dag";
        } else if (dt.hasSame(DateTime.local().plus({days: 1}), "day")) {
            return "i morgen";
        }
    }
    return dt.toFormat("cccc d.");
  }


}