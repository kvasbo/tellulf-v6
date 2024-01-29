/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

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
  </div>`
});