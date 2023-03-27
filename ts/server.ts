import express from 'express';
import { google } from 'googleapis';
require('dotenv').config();

const app = express();
const port = 3000;

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

const GOOGLE_KEY = JSON.parse(Buffer.from(process.env.GOOGLE_KEY_B64, 'base64').toString('utf8')); 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(GOOGLE_KEY);
})

accessCalendar();

function accessCalendar() {

  const jwtClient = new google.auth.JWT(
    GOOGLE_KEY.client_email,
    null,
    GOOGLE_KEY.private_key,
    SCOPES
);

    const calendar = google.calendar({
        version: 'v3',
        // project: GOOGLE_KEY.project_id,
        auth: jwtClient
    });

   // const from = 

  calendar.events.list({
    calendarId: "kvasbo.no_ognucfh1asvpgc50mqms5tu0kk@group.calendar.google.com"
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
      if (result.data.items.length) {
        result.data.items.forEach(e => {
          console.log(e.summary);
        });
      } else {
        console.log(JSON.stringify({ message: 'No upcoming events found.' }));
      }
    }
  });

}