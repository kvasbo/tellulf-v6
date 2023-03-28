import express from 'express';
import path from 'path';
import { Calendar } from './Calendar';
import { Clock } from './Clock';
import Twig from 'twig';

const app = express();

// Express settings

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'twig');
app.use(express.static('public')); // Static routes
app.use('/assets', express.static(path.join(__dirname, '../assets')));
const port = 3000;

app.get('/', (req, res) => {
  res.render('index.twig', {});
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
