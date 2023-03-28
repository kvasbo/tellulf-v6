import { Weather } from './Weather';
import { Calendar } from './Calendar';
import { Clock } from './Clock';
import { getSunrise, getSunset } from 'sunrise-sunset-js';

export class Days {

  public weather;
  private calendar; 

  constructor() {
    this.weather = new Weather();
    this.calendar = new Calendar();
  }

  public generateComingDays(numberOfDays: number = 12) {
    const days: any = [];
    for (let i = 0; i < numberOfDays; i++) {
      days.push(this.getDataForDate(new Date(new Date().setDate(new Date().getDate() + i))));
    }
    console.log(days);
    return days;
  }

  public GenerateToday(): any {
    return this.getDataForDate();
  }

  private getDataForDate(datetime: Date = new Date()): {
    date: string;
    weekday: string;
    forecast: any;
    daily_forecast: any;
    events: any;
    birthdays: any;
    sunrise: string;
    sunset: string;
} {
    const date = datetime.toISOString().slice(0, 10);

    const sunRise = getSunrise(59.9139, 10.7522);
    const sunSet = getSunset(59.9139, 10.7522);

    const forecast = null; // this.weather.getSixHourForecasts();
    const daily = null; // this.weather.getDailyForecasts();

    return {
        date: Days.createNiceDate(datetime),
        weekday: Days.createNiceDate(datetime, true, true),
        forecast: [], //forecast[date] ? forecast[date] : {},
        daily_forecast: [], // daily[date] ? daily[date] : {},
        events: [], // this.calendar.getEvents(date),
        birthdays: [],// this.calendar.getBirthdays(date),
        sunrise: sunRise.toTimeString(),
        sunset: sunSet.toTimeString(), 
    };
}


  /** 
   * Nicely format a date
   * To be switched to using Luxon 
   */
  private static createNiceDate(datetime: Date, showDate = true, relative = false): string {
    if (relative) {
        const diffInMilliseconds = datetime.getTime() - new Date().setHours(0, 0, 0, 0);
        const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);
        if (diffInDays === 0) {
            return "i dag";
        } else if (diffInDays === 1) {
            return "i morgen";
        }
    }
    const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const weekday = datetime.getUTCDay();
    let out = days[weekday];
    if (showDate) {
        out += " " + datetime.getUTCDate() + ".";
    }
    return out;
}


}