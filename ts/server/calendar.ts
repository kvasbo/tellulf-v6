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

export class Calendar {

    public static getEvents() {
      const id = process.env.CAL_ID_FELLES ? process.env.CAL_ID_FELLES : '';
      const calendarData = this.getCalendarData(id);
    }

    /**
     * Get the content of a calendar
     * @param calendarId 
     */
    private static getCalendarData(calendarId: string): Event[] {

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

    const out: string[] = [];
    
    calendar.events.list({
      calendarId: calendarId,
      timeMin: DateTime.now().toISO(),
      timeMax: DateTime.now().plus({weeks: 2}).toISO(),
      maxResults: 2000,
      singleEvents: true,
      orderBy: 'startTime',
    }, (error, result) => {
      if (error) {
        console.error(error.message)
      } else {
        if (result?.data?.items?.length) {
          return result.data.items.map((event: calendar_v3.Schema$Events) => {
            return this.parseEvent(event);
          });
        } else {
          console.log(JSON.stringify({ message: 'No upcoming events found.' }));
        }
      }
    });
  }

  private static parseEvent(event: calendar_v3.Schema$Events): Event {
    const title = event.summary ? event.summary : '';
    const start = new Date();
    const end = new Date();
    const fullDay = true;
    console.log(event);
    return { title, start, end, fullDay };
  }


}