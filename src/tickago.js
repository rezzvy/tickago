class TickAgo {
  /** Time constants in seconds and milliseconds */
  static SECOND_IN_SECONDS = 1;
  static MINUTE_IN_SECONDS = 60;
  static HOUR_IN_SECONDS = 3600;
  static DAY_IN_SECONDS = 86400;
  static MILLISECONDS_IN_SECOND = 1000;
  static MILLISECONDS_IN_MINUTE = 1000 * 60;
  static MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
  static MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

  /** Cache for storing previously computed values */
  static cache = new Map();

  /**
   * Get seconds in a month (based on the given date)
   * @param {Date} [date=new Date()] - The date to calculate from
   * @returns {number} - Seconds in the given month
   */
  static MONTH_IN_SECONDS(date = new Date()) {
    const key = `month-${date.getFullYear()}-${date.getMonth()}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const seconds = daysInMonth * this.DAY_IN_SECONDS;
    this.cache.set(key, seconds);
    return seconds;
  }

  /**
   * Get seconds in a year (adjusts for leap years)
   * @param {Date} [date=new Date()] - The date to calculate from
   * @returns {number} - Seconds in the given year
   */
  static YEAR_IN_SECONDS(date = new Date()) {
    const key = `year-${date.getFullYear()}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const isLeapYear = (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || date.getFullYear() % 400 === 0;
    const seconds = (isLeapYear ? 366 : 365) * this.DAY_IN_SECONDS;
    this.cache.set(key, seconds);
    return seconds;
  }

  /**
   * Parse various date formats into a Date object
   * @param {string|Date} input - The date input
   * @param {string} [format] - The expected date format
   * @returns {Date} - Parsed date object
   * @throws {Error} - If the date format is invalid
   */
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

  /**
   * Convert a timestamp into a relative time string (e.g., "5 minutes ago")
   * @param {string|Date} timestamp - The timestamp to convert
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.format] - The expected date format
   * @param {Object} [options.labels] - Custom labels for time units
   * @returns {string} - Formatted relative time string
   */
  static moment(timestamp, options = {}) {
    const now = new Date();
    const past = this.parseDate(timestamp, options.format);
    const elapsed = Math.floor((now - past) / 1000);

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

  /**
   * Compare two dates and return the difference in multiple units
   * @param {string|Date} dateOne - First date
   * @param {string|Date} dateTwo - Second date
   * @param {string} [format] - The expected date format
   * @returns {Object} - Object containing the time difference in various units
   */
  static compare(dateOne, dateTwo, format) {
    const startDate = this.parseDate(dateOne, format);
    const endDate = this.parseDate(dateTwo, format);

    const elapsedTimeMs = Math.abs(endDate - startDate);
    const elapsedTime = elapsedTimeMs / this.MILLISECONDS_IN_SECOND;

    const years = Math.floor(elapsedTime / this.YEAR_IN_SECONDS(startDate));
    const remainingTimeAfterYears = elapsedTime % this.YEAR_IN_SECONDS(startDate);

    const months = Math.floor(remainingTimeAfterYears / this.MONTH_IN_SECONDS(startDate));
    const remainingTimeAfterMonths = remainingTimeAfterYears % this.MONTH_IN_SECONDS(startDate);

    const days = Math.floor(remainingTimeAfterMonths / this.DAY_IN_SECONDS);
    const remainingTimeAfterDays = remainingTimeAfterMonths % this.DAY_IN_SECONDS;

    const hours = Math.floor(remainingTimeAfterDays / this.HOUR_IN_SECONDS);
    const remainingTimeAfterHours = remainingTimeAfterDays % this.HOUR_IN_SECONDS;

    const minutes = Math.floor(remainingTimeAfterHours / this.MINUTE_IN_SECONDS);
    const seconds = Math.floor(remainingTimeAfterHours % this.MINUTE_IN_SECONDS);

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

// Export for Node.js or attach to the window object in browsers
if (typeof module !== "undefined" && module.exports) {
  module.exports = TickAgo;
} else {
  window.TickAgo = TickAgo;
}
