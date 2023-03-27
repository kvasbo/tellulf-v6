import express from 'express';
import { Calendar } from './calendar';

const app = express();
const port = 3000;

Calendar.getEvents();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);

})

// accessCalendar();

