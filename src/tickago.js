class TickAgo {
  static defaultLabels = {
    past: "{value} {unit}{plural} ago",
    future: "in {value} {unit}{plural}",
    now: "just now",
    units: {
      year: "year",
      month: "month",
      day: "day",
      hour: "hour",
      minute: "minute",
      second: "second",
    },
    plural: (value) => (value > 1 ? "s" : ""),
  };

  static #calculate(start, end) {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();
    let seconds = end.getSeconds() - start.getSeconds();

    if (seconds < 0) {
      minutes--;
      seconds += 60;
    }
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) {
      days--;
      hours += 24;
    }
    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }

    if (days < 0) {
      months--;
      const daysInStartMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      days = daysInStartMonth - start.getDate() + end.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days, hours, minutes, seconds };
  }

  static compare(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1.getTime())) {
      throw new Error("Invalid parameter: date1 is not a valid date");
    }
    if (isNaN(d2.getTime())) {
      throw new Error("Invalid parameter: date2 is not a valid date");
    }

    const isFuture = d2 > d1;
    const start = isFuture ? d1 : d2;
    const end = isFuture ? d2 : d1;
    const semanticDiff = this.#calculate(start, end);
    const diffMs = end.getTime() - start.getTime();
    const raw = {
      milliseconds: diffMs,
      seconds: diffMs / 1000,
      minutes: diffMs / (1000 * 60),
      hours: diffMs / (1000 * 60 * 60),
      days: diffMs / (1000 * 60 * 60 * 24),
      months: diffMs / (1000 * 60 * 60 * 24 * (365.25 / 12)),
    };
    return { ...semanticDiff, raw, isFuture };
  }

  static moment(timestamp, labels = {}) {
    const d = new Date(timestamp);

    if (isNaN(d.getTime())) {
      throw new Error("Invalid parameter: timestamp is not a valid date");
    }

    if (typeof labels !== "object" || labels === null) {
      throw new Error("Invalid parameter: labels must be an object");
    }

    const diff = this.compare(new Date(), d);
    let value = 0;
    let unit = "";

    if (diff.years > 0) {
      value = diff.years;
      unit = "year";
    } else if (diff.months > 0) {
      value = diff.months;
      unit = "month";
    } else if (diff.days > 0) {
      value = diff.days;
      unit = "day";
    } else if (diff.hours > 0) {
      value = diff.hours;
      unit = "hour";
    } else if (diff.minutes > 0) {
      value = diff.minutes;
      unit = "minute";
    } else if (diff.seconds > 1) {
      value = diff.seconds;
      unit = "second";
    } else {
      return labels.now || TickAgo.defaultLabels.now;
    }

    const merged = {
      ...TickAgo.defaultLabels,
      ...labels,
      units: { ...TickAgo.defaultLabels.units, ...(labels.units || {}) },
    };

    if (typeof merged.plural !== "function") {
      throw new Error("Invalid parameter: labels.plural must be a function");
    }
    if (typeof merged.past !== "string" || typeof merged.future !== "string") {
      throw new Error("Invalid parameter: labels.past and labels.future must be strings");
    }

    const plural = merged.plural(value, unit);
    const unitLabel = merged.units[unit] || unit;
    const template = diff.isFuture ? merged.future : merged.past;

    const hasAllPlaceholders = template.includes("{value}") && template.includes("{unit}") && template.includes("{plural}");
    const safeTemplate = hasAllPlaceholders ? template : diff.isFuture ? TickAgo.defaultLabels.future : TickAgo.defaultLabels.past;

    return safeTemplate.replace("{value}", value).replace("{unit}", unitLabel).replace("{plural}", plural);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TickAgo;
} else {
  window.TickAgo = TickAgo;
}
