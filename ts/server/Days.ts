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
    console.log(days);
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

    const forecast = null; // this.weather.getSixHourForecasts();
    const daily = null; // this.weather.getDailyForecasts();

    return {
        isoDate: date,
        date: Days.createNiceDate(jsDate),
        weekday: Days.createNiceDate(jsDate, true),
        forecast: [], //forecast[date] ? forecast[date] : {},
        daily_forecast: [], // daily[date] ? daily[date] : {},
        events: this.calendar.getEvents(date),
        birthdays: [],// this.calendar.getBirthdays(date),
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
        const today = DateTime.now().setLocale('nb').startOf("day");
        const tomorrow = today.plus({ days: 1 });
        if (dt === today) {
            return "i dag";
        } else if (dt === tomorrow) {
            return "i morgen";
        }
    }
    return dt.toFormat("cccc d.");
  }


}