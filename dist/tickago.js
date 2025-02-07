class TickAgo {
  static SECOND_IN_SECONDS = 60;
  static HOUR_IN_SECONDS = 3600;
  static DAY_IN_SECONDS = 86400;
  static MONTH_IN_SECONDS = 2592000;
  static YEAR_IN_SECONDS = 31536000;
  static MILLISECONDS_IN_SECOND = 1000;
  static MILLISECONDS_IN_MINUTE = 1000 * 60;
  static MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
  static MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

  static parseDate(input, format) {
    if (input instanceof Date) return input;

    if (format && typeof input === "string") {
      const parts = input.match(/\d+/g);
      if (!parts) throw new Error("Invalid date format");

      const map = {};
      format.split(/[-/.\s]/).forEach((key, i) => (map[key] = +parts[i]));

      return new Date(map["YYYY"], (map["MM"] || 1) - 1, map["DD"] || 1);
    }

    const parsedDate = new Date(input);
    if (+parsedDate) return parsedDate;

    throw new Error("Invalid date format");
  }

  static moment(timestamp, options = {}) {
    const now = new Date();
    const past = this.parseDate(timestamp, options.format);
    const elapsed = Math.floor((now - past) / 1000);

    const labels = options.labels ?? {};
    const { sec = "sec ago", minutes = "minutes ago", hours = "hours ago", days = "days ago", months = "months ago", years = "years ago" } = labels;

    const timeUnits = [
      { limit: this.SECOND_IN_SECONDS, value: elapsed, unit: sec },
      { limit: this.HOUR_IN_SECONDS, value: Math.floor(elapsed / this.SECOND_IN_SECONDS), unit: minutes },
      { limit: this.DAY_IN_SECONDS, value: Math.floor(elapsed / this.HOUR_IN_SECONDS), unit: hours },
      { limit: this.MONTH_IN_SECONDS, value: Math.floor(elapsed / this.DAY_IN_SECONDS), unit: days },
      { limit: this.YEAR_IN_SECONDS, value: Math.floor(elapsed / this.MONTH_IN_SECONDS), unit: months },
    ];

    for (const { limit, value, unit } of timeUnits) {
      if (elapsed < limit) return `${value} ${unit}`;
    }

    return `${Math.floor(elapsed / this.YEAR_IN_SECONDS)} ${years}`;
  }

  static compare(dateOne, dateTwo, format) {
    const startDate = this.parseDate(dateOne, format);
    const endDate = this.parseDate(dateTwo, format);

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    const elapsedTime = endDate - startDate;
    const totalDays = Math.floor(elapsedTime / this.MILLISECONDS_IN_DAY);

    if (days < 0) {
      months--;
      const daysInPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
      days += daysInPreviousMonth;

      if (days < 0) days = 0;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const hours = Math.floor((elapsedTime % this.MILLISECONDS_IN_DAY) / this.MILLISECONDS_IN_HOUR);
    const minutes = Math.floor((elapsedTime % this.MILLISECONDS_IN_HOUR) / this.MILLISECONDS_IN_MINUTE);
    const seconds = Math.floor((elapsedTime % this.MILLISECONDS_IN_MINUTE) / this.MILLISECONDS_IN_SECOND);

    if (totalDays < days) {
      days = totalDays;
    }

    const raw = {
      seconds: Math.floor(elapsedTime / this.MILLISECONDS_IN_SECOND),
      minutes: Math.floor(elapsedTime / this.MILLISECONDS_IN_MINUTE),
      hours: Math.floor(elapsedTime / this.MILLISECONDS_IN_HOUR),
      days: totalDays,
      months: years * 12 + months,
    };

    return { years, months, days, hours, minutes, seconds, elapsedTime, raw };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TickAgo;
} else {
  window.TickAgo = TickAgo;
}
