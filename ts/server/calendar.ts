import { google } from 'googleapis';
require('dotenv').config();

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Get the Google key from the environment variable
const key64 = process.env.GOOGLE_KEY_B64 ? process.env.GOOGLE_KEY_B64 : '';
const GOOGLE_KEY = JSON.parse(Buffer.from(key64, 'base64').toString('utf8')); 

export interface Event {
  title: string;
  start: Date;
  end: Date;
  fullDay: boolean;
}

export class Calendar {

    public static getEvents() {
      const id = process.env.CAL_ID_FELLES ? process.env.CAL_ID_FELLES : '';
      this.accessCalendar(id);
    }

    /**
     * Get the content of a calendar
     * @param calendarId 
     */
    private static accessCalendar(calendarId: string) {

    const jwtClient = new google.auth.JWT(
      GOOGLE_KEY.client_email,
      undefined,
      GOOGLE_KEY.private_key,
      SCOPES
    );
    
    const calendar = google.calendar({
        version: 'v3',
        // project: GOOGLE_KEY.project_id,
        auth: jwtClient
    });
    
    calendar.events.list({
      calendarId: calendarId
      ,
      timeMin: (new Date()).toISOString(),
      // timeMax: (new Date().setDate(new Date().getDate())).toISOString(),
      maxResults: 2000,
      singleEvents: true,
      orderBy: 'startTime',
    }, (error, result) => {
      if (error) {
        console.error(error.message)
      } else {
        if (result?.data?.items?.length) {
          result.data.items.forEach(e => {
            console.log(e.summary);
          });
        } else {
          console.log(JSON.stringify({ message: 'No upcoming events found.' }));
        }
      }
    });
  }
}