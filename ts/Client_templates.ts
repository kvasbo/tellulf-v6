/* eslint-disable @typescript-eslint/no-unused-vars */
 
 

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Twig: any;

const hourlyWeatherTemplate = Twig.twig({
  data: `
  <div class="weather">
    {% for weather in hourly_weather|slice(1, 18) %}
    <div class="forecast_point">
      <div class="time">{{ weather.hour }}</div>
      <div class="weather_symbol">
        <img class="weather_icon" src="assets/weathericon/png/{{ weather.symbol }}.png" />
      </div>
      <div class="temperature">
        {{ weather.instant.air_temperature|round }}&deg;
      </div>
      <div class="forecast_prob">
        <div class="forecast_prob">
          {% if weather.details.probability_of_precipitation|round != 0 %}
          {{ weather.details.probability_of_precipitation|round }}%
          <br />
          {{ weather.details.precipitation_amount }}mm
          {% else %}
          &nbsp;<br />&nbsp;
          {% endif %}
        </div>
      </div>
    </div>
    {% endfor %}
  </div>`,
});

const calendarDay = Twig.twig({
  data: `
  {% for day in days %}
    {% if day.birthdays is not empty or day.events is not empty or day.daily_forecast is not empty %}
      <div class="calendar_day">
        <div class="dateHeader">{{ day.weekday }}
          <div class="headerWeather">
            {% if day.daily_forecast is not empty %}
            <img class="headerWeatherTempIcon" src="assets/low-temperature.png" />
            {{ day.daily_forecast.minTemp|round }}&deg;
            <img class="headerWeatherTempIcon" src="assets/high-temperature.png" />
            {{ day.daily_forecast.maxTemp|round }}&deg;
            <img class="headerWeatherIcon" src="assets/weathericon/png/{{ day.daily_forecast.symbol }}.png" />
            {% endif %}
          </div>
        </div>
        <div class="dinner">
          {% for dinner in day.dinner %}
          <div class="dinner"><img class='calendaricon birthday' src="assets/dinner.svg">{{ dinner.displayTitle }}</div>
          {% endfor %}
        </div>
        <div class="birthdays">
          {% for birthday in day.birthdays %}
          <div class="birthday"><img class='calendaricon birthday' src="assets/birthday.svg">{{ birthday.displayTitle }}</div>
          {% endfor %}
        </div>
        <div class="events">
          {% for event in day.events %}
          {% if event.fullDay == true %}
          <div class="event">{{ event.displayTitle }}</div>
          {% else %}
          <div class="event">
            <span class="event-time">
            <span class="event-time-start">
              {{ event.displayTime.start }}
            </span>
            <span class="event-time-spacer">
              {{ event.displayTime.spacer }}
            </span>
            <span class="event-time-start">
              {{ event.displayTime.end }}
            </span>
            </span>{{ event.displayTitle }}
          </div>
          {% endif %}
          {% endfor %}
        </div>
      </div>
    {% endif %}
  {% endfor %}`,
});
