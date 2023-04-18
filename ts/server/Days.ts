import { Weather, DailyForecast } from './Weather';
import { Calendar, Event } from './Calendar';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import { DateTime } from 'luxon';

export interface DayInfo {
    isoDate: string;
    date: string;
    weekday: string;
    daily_forecast: DailyForecast;
    events: Event[];
    birthdays: Event[];
    sunrise: string;
    sunset: string;
}

export class Days {
    public weather: Weather;
    private calendar: Calendar;

    constructor() {
        this.weather = new Weather();
        this.calendar = new Calendar();
    }

    public generateComingDays(numberOfDays = 10): DayInfo[] {
        const days: DayInfo[] = [];
        for (let i = 0; i < numberOfDays; i++) {
            const dt = DateTime.now().plus({ days: i });
            days.push(this.getDataForDate(dt.toJSDate()));
        }
        return days;
    }

    public GenerateToday(): DayInfo {
        return this.getDataForDate(DateTime.now().toJSDate());
    }

    private getDataForDate(jsDate: Date): DayInfo {
        // Create a Luxon DateTime object
        const dt = DateTime.fromJSDate(jsDate).setLocale('nb');

        const date = dt.toISODate()?.toString() as string;

        const sunRiseDate = getSunrise(59.9139, 10.7522, jsDate);
        const sunSetDate = getSunset(59.9139, 10.7522, jsDate);

        const daily = this.weather.getDailyForecasts();

        return {
            isoDate: date,
            date: Days.createNiceDate(jsDate),
            weekday: Days.createNiceDate(jsDate, true),
            daily_forecast: daily[date],
            events: this.calendar.getEvents(jsDate),
            birthdays: this.calendar.getBirthdays(jsDate),
            sunrise: DateTime.fromJSDate(sunRiseDate)
                .setLocale('nb')
                .toFormat('HH:mm'),
            sunset: DateTime.fromJSDate(sunSetDate)
                .setLocale('nb')
                .toFormat('HH:mm'),
        };
    }

    /**
     * Nicely format a date
     * To be switched to using Luxon
     */
    private static createNiceDate(jsDate: Date, relative = false): string {
        const dt = DateTime.fromJSDate(jsDate).setLocale('nb').startOf('day');
        if (relative) {
            if (dt.hasSame(DateTime.local(), 'day')) {
                return 'i dag';
            } else if (dt.hasSame(DateTime.local().plus({ days: 1 }), 'day')) {
                return 'i morgen';
            }
        }
        return dt.toFormat('cccc d.');
    }
}
