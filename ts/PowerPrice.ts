import zod from 'zod';
import {DateTime} from 'luxon';

export class PowerPrice {

  // Validator for API data
  private prisData = zod.array(
    zod.object({
      "NOK_per_kWh": zod.number(),
      "EUR_per_kWh": zod.number(),
      "EXR": zod.number(),
      "time_start": zod.string(),
      "time_end": zod.string()
    })
  );

  private powerPrice = -999;

  public getPowerPrice(): number {
    return this.powerPrice;
  }

  public async getData(): Promise<void> {
    const now = DateTime.now();
    const dateString = now.toFormat('yyyy/MM-dd');
    const url = `https://www.hvakosterstrommen.no/api/v1/prices/${dateString}_NO1.json`;
    const data = await fetch(url);
    const jsonData = await data.json();
    const validated = this.prisData.parse(jsonData);

    // Run the update loop for the price every hour on the hour
    const delay = 3600000 - (now.minute * 60000 + now.second * 1000 + now.millisecond);
    console.log(`Delay until next power price update is ${Math.round(delay/1000)} seconds`)
    setTimeout(this.getData, delay);
    
    // Find the element in the array that contains the current time between time_start and time_end
    const currentPrice = validated.find((element) => {
      const start = DateTime.fromISO(element.time_start);
      const end = DateTime.fromISO(element.time_end);
      return start <= now && end >= now;
    });

    if (!currentPrice) {
      console.log("Could not find current power price");
      this.powerPrice = -999;
      return;
    }

    const powerPrice = currentPrice.NOK_per_kWh * 1.25;

    console.log(`Current power price is ${powerPrice} NOK/kWh`)

    this.powerPrice = powerPrice;
  }

}