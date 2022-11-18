export class DateTime {
  static formatDate(date: Date) {
    return (
      ("0" + date.getDate()).slice(-2) +
      "/" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "/" +
      date.getFullYear()
    );
  }

  static checkDateFormat(dateStr: string) {
    return /\d{2}\/\d{2}\/\d{4}/.test(dateStr);
  }

  static minutesToHours(minutes: number) {
    return Math.round((minutes / 60 + Number.EPSILON) * 100) / 100;
  }

  static durationText(minutes: number) {
    const negative = minutes < 0;
    minutes = Math.abs(minutes);

    const hours = Math.trunc(minutes / 60);
    minutes = minutes - 60 * hours;

    return (
      (negative ? "-" : "") +
      [`${hours}h`, `${minutes}m`].filter((n) => parseInt(n)).join(" ")
    );
  }

  static minutesToTime(minutes: number) {
    const hours = Math.trunc(minutes / 60);
    minutes = minutes - 60 * hours;

    return `${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}`;
  }

  static getDateFrom(dateFrom: string) {
    if (DateTime.checkDateFormat(dateFrom)) {
      return dateFrom;
    } else {
      const now = new Date();
      return DateTime.formatDate(
        new Date(now.getFullYear(), now.getMonth(), 1)
      );
    }
  }

  static getDateTo(dateTo: string) {
    if (DateTime.checkDateFormat(dateTo)) {
      return dateTo;
    } else {
      const now = new Date();
      return DateTime.formatDate(
        new Date(now.getFullYear(), now.getMonth() + 1, 0)
      );
    }
  }
}
