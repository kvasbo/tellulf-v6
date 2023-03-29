export interface HomeyData {
  time: number;
  age: number;
  [key: string]: any;
}

import axios from 'axios';
const fs = require('fs')
require('dotenv').config();

// Get the Google key from the environment variable
const HOMEY_URL = process.env.HOMEY_URL ? process.env.HOMEY_URL : '';

const HOMEY_FILE = 'homey.json';
const HOMEY_DIR = './data';
const HOMEY_PATH = HOMEY_DIR + '/' + HOMEY_FILE;

export class Homey {
  /**
   * Get the latest data from Homey
   * @returns The latest data from Homey
   */
  static Get_Latest_Data(): HomeyData {
    let content: string | null = null;

    try {
      content = fs.readFileSync(HOMEY_PATH, 'utf8');
    } catch (error) {
      console.error('Failed to read file:', error);
    }

    let payload: HomeyData;

    if (!content) {
      payload = {
        time: 0, age: 99999
      }; // Set empty json
    } else {
      const data: HomeyData = JSON.parse(content);
      data.age = Math.round(Date.now() / 1000 - data.time); // Set age
      payload = data; // Just to ensure niceness
    }

    return payload;
  }

  static Update_Data_From_Homey() {
    axios.get(HOMEY_URL)
      .then(function (response) {
        Homey.Set_Data(response.data.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // Store the dataset
  static Set_Data(data: HomeyData) {

    // Create directory if it doesn't exist
    if (!fs.existsSync(HOMEY_DIR)) {
      fs.mkdirSync(HOMEY_DIR);
    }
    
    // Cast to numbers if possible.
    for (const [key, value] of Object.entries(data)) {
      data[key] = +value; // Map to numeric values
    }

    data.time = Math.round(Date.now() / 1000); // Set time
    data.niceTime = new Date().toISOString(); // Set nice time

    const json = JSON.stringify(data);
    fs.writeFileSync(HOMEY_PATH, json);
  }

}
