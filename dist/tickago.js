class TickAgo {
  static MINUTE_IN_SECONDS = 60;
  static HOUR_IN_SECONDS = 3600;
  static DAY_IN_SECONDS = 86400;
  static MILLISECONDS_IN_SECOND = 1000;

  static cache = new Map();

  static MONTH_IN_SECONDS(date = new Date()) {
    const key = `month-${date.getFullYear()}-${date.getMonth()}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const seconds = daysInMonth * this.DAY_IN_SECONDS;
    this.cache.set(key, seconds);
    return seconds;
  }

  static YEAR_IN_SECONDS(date = new Date()) {
    const key = `year-${date.getFullYear()}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const isLeapYear = (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || date.getFullYear() % 400 === 0;
    const seconds = (isLeapYear ? 366 : 365) * this.DAY_IN_SECONDS;
    this.cache.set(key, seconds);
    return seconds;
  }

  static parseDate(input, format) {
    if (input instanceof Date) return input;

    if (format && typeof input === "string") {
      const parts = input.match(/\d+/g);
      if (!parts) throw new Error("Invalid date format");

      const map = {};
      format.split(/[-/.\s]/).forEach((key, i) => (map[key] = +parts[i]));

      const parsedDate = new Date(map["YYYY"], (map["MM"] || 1) - 1, map["DD"] || 1);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }

    const parsedDate = new Date(input);
    if (!isNaN(parsedDate.getTime())) return parsedDate;

    throw new Error("Invalid date format");
  }

  static moment(timestamp, options = {}) {
    const now = new Date();
    const past = this.parseDate(timestamp, options.format);
    const elapsed = Math.floor((now - past) / this.MILLISECONDS_IN_SECOND);

    const labels = options.labels ?? {};
    const { sec = "sec ago", minutes = "minutes ago", hours = "hours ago", days = "days ago", months = "months ago", years = "years ago" } = labels;

    const timeUnits = [
      { limit: this.MINUTE_IN_SECONDS, value: elapsed, unit: sec },
      { limit: this.HOUR_IN_SECONDS, value: Math.floor(elapsed / this.MINUTE_IN_SECONDS), unit: minutes },
      { limit: this.DAY_IN_SECONDS, value: Math.floor(elapsed / this.HOUR_IN_SECONDS), unit: hours },
      { limit: this.MONTH_IN_SECONDS(past), value: Math.floor(elapsed / this.DAY_IN_SECONDS), unit: days },
      { limit: this.YEAR_IN_SECONDS(past), value: Math.floor(elapsed / this.MONTH_IN_SECONDS(past)), unit: months },
    ];

    for (const { limit, value, unit } of timeUnits) {
      if (elapsed < limit) return `${value} ${unit}`;
    }

    return `${Math.floor(elapsed / this.YEAR_IN_SECONDS(past))} ${years}`;
  }

  static compare(dateOne, dateTwo, format) {
    const startDate = this.parseDate(dateOne, format);
    const endDate = this.parseDate(dateTwo, format);

    const elapsedTimeMs = Math.abs(endDate - startDate);
    const elapsedTime = elapsedTimeMs / this.MILLISECONDS_IN_SECOND;

    let years = Math.floor(elapsedTime / this.YEAR_IN_SECONDS(startDate));
    const remainingTimeAfterYears = elapsedTime % this.YEAR_IN_SECONDS(startDate);

    let months = Math.floor(remainingTimeAfterYears / this.MONTH_IN_SECONDS(startDate));
    const remainingTimeAfterMonths = remainingTimeAfterYears % this.MONTH_IN_SECONDS(startDate);

    const days = Math.floor(remainingTimeAfterMonths / this.DAY_IN_SECONDS);
    const remainingTimeAfterDays = remainingTimeAfterMonths % this.DAY_IN_SECONDS;

    const hours = Math.floor(remainingTimeAfterDays / this.HOUR_IN_SECONDS);
    const remainingTimeAfterHours = remainingTimeAfterDays % this.HOUR_IN_SECONDS;

    const minutes = Math.floor(remainingTimeAfterHours / this.MINUTE_IN_SECONDS);
    const seconds = Math.floor(remainingTimeAfterHours % this.MINUTE_IN_SECONDS);

    if (months >= 12) {
      years += Math.floor(months / 12);
      months = months % 12;
    }

    const raw = {
      seconds: Math.floor(elapsedTime),
      minutes: Math.floor(elapsedTime / this.MINUTE_IN_SECONDS),
      hours: Math.floor(elapsedTime / this.HOUR_IN_SECONDS),
      days: Math.floor(elapsedTime / this.DAY_IN_SECONDS),
      months: years * 12 + months,
    };

    return { years, months, days, hours, minutes, seconds, elapsedTime: elapsedTimeMs, raw };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TickAgo;
} else {
  window.TickAgo = TickAgo;
}
