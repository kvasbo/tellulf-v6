namespace kvasbo.tellulf {

  export class Clock {

    public static getTime(time: number | null = null): string {
      if (time === null) time = Date.now() / 1000;
      const date = new Date(time * 1000);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    public static getDateFormatted(): string {
      const day = this.getDayName(new Date().getDay());
      const date = new Date().getDate();
      return `${day} ${date}.`;
    }

    public static getDayName(day: number): string {
      const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
      return days[day];
    }

    public static getMonthName(month: number): string {
      const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
      return months[month];
    }

    public static getWeek(time: number | null = null): string {
      if (time === null) time = Date.now() / 1000;
      const date = new Date(time * 1000);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return String(1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7));
    }

  }

}