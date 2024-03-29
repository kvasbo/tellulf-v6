export interface TimeData {
  time: string;
  date: string;
  week: string;
}

import { DateTime } from "luxon";

export class Clock {
  public static getTime(time: number = new Date().getTime()): TimeData {
    const dt = DateTime.fromMillis(time).setLocale("nb");
    return {
      time: dt.toLocaleString(DateTime.TIME_SIMPLE),
      date: dt.toFormat("cccc d."),
      week: dt.toFormat("W"),
    };
  }
}
