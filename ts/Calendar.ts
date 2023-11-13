import { calendar_v3, google } from 'googleapis';
import { DateTime } from 'luxon';
import * as dotenv from 'dotenv';

dotenv.config();

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Get the Google key from the environment variable
const key64 = process.env.GOOGLE_KEY_B64 ? process.env.GOOGLE_KEY_B64 : '';
const GOOGLE_KEY = JSON.parse(Buffer.from(key64, 'base64').toString('utf8'));

interface GoogleEvent {
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
        timeZone: string;
    };
    end: {
        dateTime?: string;
        date?: string;
        timeZone: string;
    };
}
export interface RawEvent {
    title: string;
    start: Date;
    end: Date;
    fullDay: boolean;
}

type DayType = 'firstDay' | 'middleDay' | 'lastDay' | 'singleDay';

interface EventDisplayTime {
    start: string;
    end: string;
    spacer: string;
}
export interface Event extends RawEvent {
    dayType: DayType;
    displayTitle: string;
    displayTime: EventDisplayTime;
}

export class Calendar {
    private events: RawEvent[] = [];
    private birthdays: RawEvent[] = [];
    private dinners: RawEvent[] = [];
    // Display height of calendar events in pixels to ensure we don't overflow
    private displayHeights = {
        event: 25,
        birthday: 25,
        dayInfo: 51,
    };

    constructor() {
        this.refreshEvents();
        this.refreshBirthdays();
        this.refreshDinners();
        setInterval(() => {
            this.refreshEvents();
            this.refreshBirthdays();
            this.refreshDinners();
        }, 600000);
    }

    public calculateDisplayHeightForDay(jsDate: Date): number {
        const eventCount = this.getEventsForDate(jsDate).length;
        const birthdays = this.getBirthdaysForDate(jsDate).length;
        const height =
            this.displayHeights.dayInfo +
            eventCount * this.displayHeights.event +
            birthdays * this.displayHeights.birthday;
        return height;
    }

    // Returns a copy of the events array
    public getEventsForDate(jsDate: Date): Event[] {
        return this.events
            .filter((e) => this.checkEventForDate(e, jsDate))
            .map((e) => this.enrichEvent(e, 'event', jsDate));
    }

    public getBirthdaysForDate(jsDate: Date): Event[] {
        return this.birthdays
            .filter((e) => this.checkEventForDate(e, jsDate))
            .map((e) => this.enrichEvent(e, 'birthday', jsDate));
    }

    public getDinnerForDate(jsDate: Date): Event[] {
        return this.dinners
            .filter((e) => this.checkEventForDate(e, jsDate))
            .map((e) => this.enrichEvent(e, 'dinner', jsDate));
    }

    // Filters events based on whether they exist on the given date
    private checkEventForDate(event: RawEvent, jsDate: Date): boolean {
        // Find start of day for all of the fuckers
        const dt = DateTime.fromJSDate(jsDate).startOf('day');
        const eventStart = DateTime.fromJSDate(event.start).startOf('day');
        const eventEnd = DateTime.fromJSDate(event.end).startOf('day');

        // It starts before or ends after!
        if (
            eventStart.toMillis() <= dt.toMillis() &&
            eventEnd.toMillis() >= dt.toMillis()
        ) {
            return true;
        }

        // Nothing to see here
        return false;
    }

    private enrichEvent(event: RawEvent, type = '', forDate: Date): Event {
        const displayTitle = Calendar.getDisplayTitle(event, type);
        const dayType = Calendar.getDayType(event, forDate);
        const displayTime = Calendar.getEventDisplayTime(event, dayType);

        return {
            ...event,
            displayTitle: displayTitle,
            dayType: dayType,
            displayTime: displayTime,
        };
    }

    private static getDisplayTitle(event: RawEvent, type: string): string {
        let title = event.title;
        if (type === 'birthday') {
            const regex = /[A-Za-z0-9 ]+\s[0-9]+/i;
            const foundYear = regex.test(event.title);
            if (foundYear) {
                const y = Number(event.title.slice(-4));
                const now = DateTime.now();
                const age = now.year - 1 * y;
                title = `${event.title.substring(
                    0,
                    event.title.length - 5
                )} (${age} år)`;
            }
        }
        return title;
    }

    private async refreshEvents(): Promise<void> {
        if (process.env.CAL_ID_FELLES) {
            this.events = await Calendar.getCalendarData(
                process.env.CAL_ID_FELLES
            );
            console.log(this.events.length + ' events fetched.');
        } else {
            this.events = [];
        }
    }

    private async refreshDinners(): Promise<void> {
        if (process.env.CAL_ID_MIDDAG) {
            this.dinners = await Calendar.getCalendarData(
                process.env.CAL_ID_MIDDAG
            );
            console.log(this.dinners.length + ' dinners fetched.');
        } else {
            this.dinners = [];
            console.log('Dinner calendar ID not found :(');
        }
    }

    private async refreshBirthdays(): Promise<void> {
        if (process.env.CAL_ID_BURSDAG) {
            this.birthdays = await Calendar.getCalendarData(
                process.env.CAL_ID_BURSDAG
            );
            console.log(this.birthdays.length + ' birthdays fetched.');
        } else {
            this.birthdays = [];
        }
    }

    /**
     * Get the content of a calendar
     * @param calendarId
     */
    private static async getCalendarData(
        calendarId: string
    ): Promise<RawEvent[]> {
        const jwtClient = new google.auth.JWT(
            GOOGLE_KEY.client_email,
            undefined,
            GOOGLE_KEY.private_key,
            SCOPES
        );

        const calendar = google.calendar({
            version: 'v3',
            auth: jwtClient,
        });

        const out: RawEvent[] = [];

        const result = await calendar.events.list({
            calendarId: calendarId,
            timeMin: DateTime.now().toISO(),
            timeMax: DateTime.now().plus({ weeks: 2 }).toISO(),
            maxResults: 2000,
            singleEvents: true,
            orderBy: 'startTime',
        });

        if (result?.data?.items?.length) {
            result.data.items.forEach((event: calendar_v3.Schema$Events) => {
                const e = Calendar.parseGoogleEvent(event);
                out.push(e);
            });
        } else {
            console.log(
                JSON.stringify({
                    message: `No upcoming events found for ${calendarId}`,
                })
            );
        }
        return out;
    }

    // Get the correct displaytime for the event
    public static getEventDisplayTime(
        event: RawEvent,
        dayType: DayType
    ): EventDisplayTime {
        if (dayType === 'middleDay') {
            return {
                start: '',
                end: '',
                spacer: '...',
            };
        }

        if (dayType === 'lastDay') {
            return {
                start: '',
                end: DateTime.fromJSDate(event.end).toFormat('HH:mm'),
                spacer: '⇝',
            };
        }

        if (dayType === 'firstDay') {
            return {
                start: DateTime.fromJSDate(event.start).toFormat('HH:mm'),
                end: '',
                spacer: '⇝',
            };
        }

        //  First or only day
        return {
            start: DateTime.fromJSDate(event.start).toFormat('HH:mm'),
            end: DateTime.fromJSDate(event.end).toFormat('HH:mm'),
            spacer: '⇝',
        };
    }

    // Figure out if same date or whether it spans multiple days. For displaying purposes
    private static getDayType(event: RawEvent, date: Date): DayType {
        const dtStart = DateTime.fromJSDate(event.start);
        const dtEnd = DateTime.fromJSDate(event.end);
        const dtDate = DateTime.fromJSDate(date);

        let dayType: DayType = 'singleDay';

        // Single day event
        if (dtStart.hasSame(dtEnd, 'day')) {
            dayType = 'singleDay';
        } else if (dtStart.hasSame(dtDate, 'day')) {
            dayType = 'firstDay';
        } else if (dtEnd.hasSame(dtDate, 'day')) {
            dayType = 'lastDay';
        } else {
            // Neither first nor last day
            dayType = 'middleDay';
        }

        return dayType;
    }

    // Main parsing of an event from Google
    private static parseGoogleEvent(
        event: calendar_v3.Schema$Events
    ): RawEvent {
        const ev = event as GoogleEvent;

        const title = event.summary ? event.summary : '';

        if (ev.start.date && ev.end.date) {
            // Fullday!
            const dtStart = DateTime.fromISO(ev.start.date).startOf('day');
            const dtEnd = DateTime.fromISO(ev.end.date)
                .minus({ days: 1 })
                .startOf('day');
            const start = dtStart.toJSDate();
            const end = dtEnd.toJSDate();
            const fullDay = true;
            return { title, start, end, fullDay };
        } else if (ev.start.dateTime && ev.end.dateTime) {
            const dtStart = DateTime.fromISO(ev.start.dateTime);
            const dtEnd = DateTime.fromISO(ev.end.dateTime);
            const start = dtStart.toJSDate();
            const end = dtEnd.toJSDate();
            const fullDay = false;
            return { title, start, end, fullDay };
        } else {
            throw new Error('Invalid event');
        }
    }
}
