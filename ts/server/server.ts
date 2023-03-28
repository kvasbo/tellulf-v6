import express from 'express';
import { Calendar } from './Calendar';
import { Clock } from './Clock';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World 2!')
})

app.get('/clock', (req, res) => {
  res.send(Clock.getTime());
});

app.get('/calendar', (req, res) => {
  res.send(Calendar.getEvents());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);

})
