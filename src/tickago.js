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

  /**
   * Parses an input string or timestamp into a Date object.
   * @param {string|number} input - The date input to parse.
   * @returns {Date} The parsed Date object.
   * @throws {Error} If the input cannot be parsed into a valid date.
   */
  static parseDate(input) {
    const parsedDate = new Date(input);
    if (+parsedDate) return parsedDate;

    throw new Error("Invalid date format");
  }

  /**
   * Returns the most recent moment from a given timestamp relative to the current time.
   * @param {string|number} timestamp - The timestamp to compare against the current time.
   * @param {Object} [lang={}] - Optional language settings for time units.
   * @param {string} [lang.sec="sec ago"] - The label for seconds.
   * @param {string} [lang.minutes="minutes ago"] - The label for minutes.
   * @param {string} [lang.hours="hours ago"] - The label for hours.
   * @param {string} [lang.days="days ago"] - The label for days.
   * @param {string} [lang.months="months ago"] - The label for months.
   * @param {string} [lang.years="years ago"] - The label for years.
   * @returns {string} The time ago in a human-readable format.
   */
  static latestMoment(timestamp, lang = {}) {
    const now = new Date();
    const past = this.parseDate(timestamp);
    const elapsed = Math.floor((now - past) / 1000);
    const { sec = "sec ago", minutes = "minutes ago", hours = "hours ago", days = "days ago", months = "months ago", years = "years ago" } = lang;

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

  /**
   * Compares two dates and returns the time difference between them.
   * @param {string|number} dateOne - The first date to compare.
   * @param {string|number} dateTwo - The second date to compare.
   * @returns {Object} An object containing the time difference: years, months, days, hours, minutes, seconds, and elapsedTime in milliseconds.
   */
  static compare(dateOne, dateTwo) {
    const startDate = this.parseDate(dateOne);
    const endDate = this.parseDate(dateTwo);

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const daysInPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
      days += daysInPreviousMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const elapsedTime = endDate - startDate;
    const hours = Math.floor((elapsedTime % this.MILLISECONDS_IN_DAY) / this.MILLISECONDS_IN_HOUR);
    const minutes = Math.floor((elapsedTime % this.MILLISECONDS_IN_HOUR) / this.MILLISECONDS_IN_MINUTE);
    const seconds = Math.floor((elapsedTime % this.MILLISECONDS_IN_MINUTE) / this.MILLISECONDS_IN_SECOND);

    return { years, months, days, hours, minutes, seconds, elapsedTime };
  }
}
