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
    displayHeight: number;
}

export class Days {
    public weather: Weather;
    private calendar: Calendar;

    // Cutoff for adding more days to the calendar
    private maxCalendarHeight = 1100;

    constructor() {
        this.weather = new Weather();
        this.calendar = new Calendar();
    }

    public generateComingDays(maxNumberOfDays = 10): DayInfo[] {
        const days: DayInfo[] = [];
        let currentHeight = 0;
        for (let i = 0; i < maxNumberOfDays; i++) {
            const dt = DateTime.now().plus({ days: i });
            const day = this.getDataForDate(dt.toJSDate());
            // Check if we are overflowing
            if (currentHeight + day.displayHeight > this.maxCalendarHeight) {
                break;
            }
            currentHeight += day.displayHeight;
            days.push(day);
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

        const dayHeight = this.calendar.calculateDisplayHeightForDay(jsDate);

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
            displayHeight: dayHeight,
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
