import { calendar_v3, google } from 'googleapis';
import { DateTime } from 'luxon';
require('dotenv').config();

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Get the Google key from the environment variable
const key64 = process.env.GOOGLE_KEY_B64 ? process.env.GOOGLE_KEY_B64 : '';
const GOOGLE_KEY = JSON.parse(Buffer.from(key64, 'base64').toString('utf8')); 

export interface Event {
  title: string;
  start: Date;
  end: Date;
  fullDay?: boolean;
}

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

export class Calendar {

    private events: Event[] = [];
    private birthdays: Event[] = [];

    constructor() { 
      this.refreshEvents();
      this.refreshBirthdays();
      setInterval(() => {
        this.refreshEvents();
        this.refreshBirthdays();
      }, 600000);
    }

    public getEvents(date: String): Event[] {
      return [];
    }

    public getBirthdays(date: String): Event[] {
      return [];
    }

    private async refreshEvents(): Promise<void> {
      const id = process.env.CAL_ID_FELLES ? process.env.CAL_ID_FELLES : '';
      this.events = await Calendar.getCalendarData(id);
      console.log("eve", this.events);
    }

    private async refreshBirthdays(): Promise<void> {
      const id = process.env.CAL_ID_BURSDAG ? process.env.CAL_ID_BURSDAG : '';
      this.birthdays = await Calendar.getCalendarData(id);
      console.log("bir", this.birthdays);
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
        auth: jwtClient
    });
    
    const out: Event[] = [];

    const result = await calendar.events.list({
      calendarId: calendarId,
      timeMin: DateTime.now().toISO(),
      timeMax: DateTime.now().plus({weeks: 2}).toISO(),
      maxResults: 2000,
      singleEvents: true,
      orderBy: 'startTime',
    });

    if (result?.data?.items?.length) {
      result.data.items.forEach((event: calendar_v3.Schema$Events) => {
        const e = Calendar.parseEvent(event);
        out.push(e);
      });
    } else {
      console.log(JSON.stringify({ message: 'No upcoming events found.' }));
    }
    return out;
  }

  private static parseEvent(event: calendar_v3.Schema$Events): Event {
    const ev = event as GoogleEvent;

    const title = event.summary ? event.summary : '';
    
    if (ev.start.date && ev.end.date) {
      // Fullday!
      const dtStart = DateTime.fromISO(ev.start.date);
      const dtEnd = DateTime.fromISO(ev.end.date);
      const start = dtStart.toJSDate();
      const end = dtEnd.toJSDate();
      const fullDay = true;
      return { title, start, end, fullDay }
    } else if (ev.start.dateTime && ev.end.dateTime) {
      const dtStart = DateTime.fromISO(ev.start.dateTime);
      const dtEnd = DateTime.fromISO(ev.end.dateTime);
      const start = dtStart.toJSDate();
      const end = dtEnd.toJSDate();
      const fullDay = false;
      return { title, start, end, fullDay }
    } else {
      throw new Error('Invalid event');
    }
  }

}