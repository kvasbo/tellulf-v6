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

export interface Event extends RawEvent {
    dayType?: DayType;
    displayTitle?: string;
    displayTime?: string;
}

export class Calendar {
    private events: Event[] = [];
    private birthdays: Event[] = [];
    // Display height of calendar events in pixels to ensure we don't overflow
    private displayHeights = {
        event: 25,
        birthday: 25,
        dayInfo: 51,
    };

    constructor() {
        this.refreshEvents();
        this.refreshBirthdays();
        setInterval(() => {
            this.refreshEvents();
            this.refreshBirthdays();
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
        const events = structuredClone(this.events);
        return events
            .filter((e) => this.checkEventForDate(e, jsDate))
            .map((e) => this.enrichEvent(e, 'event', jsDate));
    }

    public getBirthdaysForDate(jsDate: Date): Event[] {
        const birthdays = structuredClone(this.birthdays);
        return birthdays
            .filter((e) => this.checkEventForDate(e, jsDate))
            .map((e) => this.enrichEvent(e, 'birthday', jsDate));
    }

    // Filters events based on whether they exist on the given date
    private checkEventForDate(event: Event, jsDate: Date): boolean {
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

    private enrichEvent(event: Event, type = '', forDate: Date): Event {
        event.displayTitle = event.title;
        event.dayType = Calendar.getDayType(event, forDate);
        if (type === 'birthday') {
            const regex = /[A-Za-z0-9 ]+\s[0-9]+/i;
            const foundYear = regex.test(event.title);
            if (foundYear) {
                const y = Number(event.title.slice(-4));
                const now = DateTime.now();
                const age = now.year - 1 * y;
                event.displayTitle = `${event.title.substring(
                    0,
                    event.title.length - 5
                )} (${age})`;
            }
        }

        // Not working!
        event.displayTime = Calendar.getEventDisplayTime(event);

        return event;
    }

    private async refreshEvents(): Promise<void> {
        if (process.env.CAL_ID_FELLES) {
            this.events = await Calendar.getCalendarData(
                process.env.CAL_ID_FELLES
            );
        } else {
            this.events = [];
        }
    }

    private async refreshBirthdays(): Promise<void> {
        if (process.env.CAL_ID_BURSDAG) {
            this.birthdays = await Calendar.getCalendarData(
                process.env.CAL_ID_BURSDAG
            );
        } else {
            this.birthdays = [];
        }
    }

    /**
     * Get the content of a calendar
     * @param calendarId
     */
    private static async getCalendarData(calendarId: string): Promise<Event[]> {
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

        const out: Event[] = [];

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
                JSON.stringify({ message: 'No upcoming events found.' })
            );
        }
        return out;
    }

    public static getEventDisplayTime(event: Event): string {
        if (event.dayType === 'middleDay') {
            return '...';
        } else if (event.dayType === 'lastDay') {
            return '-> ' + DateTime.fromJSDate(event.end).toFormat('HH:mm');
        } else {
            return DateTime.fromJSDate(event.start).toFormat('HH:mm');
        }
    }

    // Figure out if same date or whether it spans multiple days. For displaying purposes
    private static getDayType(event: Event, date: Date): DayType {
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
