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