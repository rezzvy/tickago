class TickAgo {
  static MINUTE_IN_SECONDS = 60;
  static HOUR_IN_SECONDS = 3600;
  static DAY_IN_SECONDS = 86400;
  static MILLISECONDS_IN_SECOND = 1000;
  static MAX_CACHE_SIZE = 100;
  static #cache = new Map();
  static #cacheOrder = [];

  static #defaultLabels = {
    justNow: "just now",
    second: { past: "sec ago", future: "sec" },
    minute: { past: "minutes ago", future: "minutes" },
    hour: { past: "hours ago", future: "hours" },
    day: { past: "days ago", future: "days" },
    week: { past: "weeks ago", future: "weeks" },
    month: { past: "months ago", future: "months" },
    year: { past: "years ago", future: "years" },
    futurePrefix: "in ",
  };

  static MONTH_IN_SECONDS(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const cacheKey = `month-${year}-${month}`;

    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const seconds = daysInMonth * this.DAY_IN_SECONDS;

    this.#setCache(cacheKey, seconds);
    return seconds;
  }

  static YEAR_IN_SECONDS(date = new Date()) {
    const year = date.getFullYear();
    const cacheKey = `year-${year}`;

    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const seconds = (isLeapYear ? 366 : 365) * this.DAY_IN_SECONDS;

    this.#setCache(cacheKey, seconds);
    return seconds;
  }

  static #setCache(key, value) {
    if (this.#cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.#cacheOrder.shift();
      this.#cache.delete(oldestKey);
    }

    this.#cache.set(key, value);
    this.#cacheOrder.push(key);
  }

  static parseDate(input, format) {
    if (input instanceof Date) {
      if (isNaN(input.getTime())) {
        throw new Error("Invalid Date object");
      }
      return input;
    }

    if (typeof input === "number") {
      const date = new Date(input);
      if (!isNaN(date.getTime())) return date;
      throw new Error("Invalid timestamp");
    }

    if (typeof input !== "string") {
      throw new Error("Input must be a string or Date object");
    }

    if (format) {
      return this.#parseWithFormat(input, format);
    }

    const parsedDate = new Date(input);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch.map(Number);
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        return date;
      }
    }

    throw new Error("Invalid date format");
  }

  static #parseWithFormat(input, format) {
    const formatParts = format.split(/[-\/.\s]/);
    const inputParts = input.split(/[-\/.\s]/);

    if (formatParts.length !== inputParts.length) {
      throw new Error("Format does not match input");
    }

    const dateParts = {};
    for (let i = 0; i < formatParts.length; i++) {
      const part = formatParts[i].toUpperCase();
      dateParts[part] = parseInt(inputParts[i], 10);
    }

    const year = dateParts.YYYY || dateParts.YY;
    let month = (dateParts.MM || 1) - 1;
    const day = dateParts.DD || 1;

    if (!year) {
      throw new Error("Year is required in format");
    }

    const fullYear = year < 100 ? 2000 + year : year;

    const date = new Date(fullYear, month, day);
    if (isNaN(date.getTime()) || date.getFullYear() !== fullYear || date.getMonth() !== month || date.getDate() !== day) {
      throw new Error("Invalid date values");
    }

    return date;
  }

  static moment(timestamp, options = {}) {
    try {
      const now = new Date();
      const targetDate = this.parseDate(timestamp, options.format);
      const isFuture = now < targetDate;
      const diffMs = Math.abs(now - targetDate);
      const diffSeconds = Math.floor(diffMs / this.MILLISECONDS_IN_SECOND);

      if (diffSeconds < 1) {
        return options.labels?.justNow || this.#defaultLabels.justNow;
      }

      const labels = {
        ...this.#defaultLabels,
        ...options.labels,
      };

      const timeDiff = this.#calculateTimeDifference(now, targetDate);

      const { unit, value } = this.#getAppropriateUnit(timeDiff, diffSeconds);

      return this.#formatOutput(value, unit, isFuture, labels);
    } catch (error) {
      console.error("Error in moment method:", error);
      return "Invalid date";
    }
  }

  static #calculateTimeDifference(date1, date2) {
    let startDate = new Date(date1);
    let endDate = new Date(date2);

    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const hours = endDate.getHours() - startDate.getHours();
    const minutes = endDate.getMinutes() - startDate.getMinutes();
    const seconds = endDate.getSeconds() - startDate.getSeconds();

    return {
      years,
      months,
      days,
      hours: hours < 0 ? 24 + hours : hours,
      minutes: minutes < 0 ? 60 + minutes : minutes,
      seconds: seconds < 0 ? 60 + seconds : seconds,
    };
  }

  static #getAppropriateUnit(timeDiff, diffSeconds) {
    const { years, months, days, hours, minutes, seconds } = timeDiff;

    if (years > 0) return { unit: "year", value: years };
    if (months > 0) return { unit: "month", value: months };
    if (days >= 7) return { unit: "week", value: Math.floor(days / 7) };
    if (days > 0) return { unit: "day", value: days };
    if (hours > 0) return { unit: "hour", value: hours };
    if (minutes > 0) return { unit: "minute", value: minutes };
    return { unit: "second", value: seconds };
  }

  static #formatOutput(value, unit, isFuture, labels) {
    const unitLabel = labels[unit] || { past: unit, future: unit };
    const label = isFuture ? unitLabel.future : unitLabel.past;

    if (isFuture) {
      const prefix = labels.futurePrefix || this.#defaultLabels.futurePrefix;
      return `${prefix}${value} ${label}`;
    }

    return `${value} ${label}`;
  }

  static compare(dateOne, dateTwo, format) {
    try {
      const startDate = this.parseDate(dateOne, format);
      const endDate = this.parseDate(dateTwo, format);

      const timeDiff = this.#calculateTimeDifference(startDate, endDate);
      const isFuture = startDate < endDate;
      const elapsedTime = Math.abs(startDate - endDate);

      const raw = {
        seconds: Math.floor(elapsedTime / this.MILLISECONDS_IN_SECOND),
        minutes: Math.floor(elapsedTime / (this.MILLISECONDS_IN_SECOND * this.MINUTE_IN_SECONDS)),
        hours: Math.floor(elapsedTime / (this.MILLISECONDS_IN_SECOND * this.HOUR_IN_SECONDS)),
        days: Math.floor(elapsedTime / (this.MILLISECONDS_IN_SECOND * this.DAY_IN_SECONDS)),
        months: timeDiff.years * 12 + timeDiff.months,
      };

      return {
        ...timeDiff,
        isFuture,
        elapsedTime,
        raw,
      };
    } catch (error) {
      console.error("Error in compare method:", error);
      return { error: error.message };
    }
  }

  static clearCache() {
    this.#cache.clear();
    this.#cacheOrder = [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TickAgo;
} else {
  window.TickAgo = TickAgo;
}
