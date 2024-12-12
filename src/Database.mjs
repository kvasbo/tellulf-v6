import pg from "pg";
const { Client } = pg;
const client = new Client();

export class Database {
  constructor() {
    client.connect();
  }

  async putTemperaturePoint(temp) {
    const tempInt = parseInt(temp * 100);
    const query = {
      text: "INSERT INTO temperature (temperature) VALUES ($1)",
      values: [tempInt],
    };
    await client.query(query);
  }
}
