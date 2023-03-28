interface HomeyData {
  time: number;
  age: number;
  [key: string]: any;
}

const fs = require('fs')

// Get the Google key from the environment variable
const HOMEY_FILE = process.env.HOMEY_FILE ? process.env.HOMEY_FILE : 'homey_notdefined.json';

class Homey {
  static Get_Latest_Data(): HomeyData {
    let content: string | null = null;

    try {
      content = fs.readFileSync(HOMEY_FILE, 'utf8');
    } catch (error) {
      console.error('Failed to read file:', error);
    }

    let payload: HomeyData;

    if (!content) {
      payload = {
        time: 0, age: 999999999999
      }; // Set empty json
    } else {
      const data: HomeyData = JSON.parse(content);
      data.age = Date.now() / 1000 - data.time; // Set age
      payload = data; // Just to ensure niceness
    }

    return payload;
  }
}
