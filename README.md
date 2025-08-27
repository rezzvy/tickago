# TickAgo

## Overview

A JavaScript library to calculate and compare elapsed time.

- Automatically detects elapsed time: seconds, minutes, hours, months, or years ago.
- Compare two times and get the elapsed time object.
- Customizable and flexible.
- And more to explore!

## Installation

Via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/rezzvy/tickago@latest/dist/tickago.min.js"></script>
```

Via npm:

```bash
npm install tickago
```

Then import it:

```javascript
const TickAgo = require("tickago");
```

## Usage

### `moment(timestamp, labels?)`

Returns a human-readable string relative to the current time.

```javascript
// From Date object
console.log(TickAgo.moment(new Date("2011-11-11")));
// → "13 years ago"

// From timestamp
console.log(TickAgo.moment(Date.now() - 5000));
// → "5 seconds ago"

// From string
console.log(TickAgo.moment("2011-11-11"));
// → "13 years ago"

// With custom labels (example: Indonesian)
console.log(
  TickAgo.moment(Date.now() - 5000, {
    past: "{value} {unit}{plural} yang lalu",
    future: "dalam {value} {unit}{plural}",
    now: "baru saja",
    units: {
      second: "detik",
    },
    plural: (v) => (v > 1 ? "" : ""), // no plural 's'
  })
);
// → "5 detik yang lalu"
```

#### Notes

- `timestamp` can be a **Date object**, **timestamp number**, or **string parsable by `new Date()`**.
- Invalid values will throw an `Error`.
- The second parameter (`labels`) is optional and must be an object with a structure like the default:

```javascript
{
  past: "{value} {unit}{plural} ago",
  future: "in {value} {unit}{plural}",
  now: "just now",
  units: {
    year: "year",
    month: "month",
    day: "day",
    hour: "hour",
    minute: "minute",
    second: "second"
  },
  plural: (value, unit) => (value > 1 ? "s" : "")
}
```

The template must contain `{value}`, `{unit}`, and `{plural}`.
If not, it will safely fall back to the default template.

### `compare(date1, date2)`

Returns the exact difference between two dates.

```javascript
console.log(TickAgo.compare("2015-01-01", "2025-01-01"));
```

Output:

```json
{
  "years": 10,
  "months": 0,
  "days": 0,
  "hours": 0,
  "minutes": 0,
  "seconds": 0,
  "raw": {
    "milliseconds": 315619200000,
    "seconds": 315619200,
    "minutes": 5260320,
    "hours": 87672,
    "days": 3653
  },
  "isFuture": true
}
```

#### Notes

- `date1` and `date2` can be **Date objects**, **timestamps**, or **strings**.
- Invalid values will throw an `Error`.
- The `isFuture` flag indicates whether `date2` is greater than `date1`.

## Error Handling

TickAgo will throw descriptive errors in cases such as:

- `moment()` receives an invalid timestamp.
- `compare()` receives an invalid date.
- `labels` is not an object or has the wrong structure (e.g., `plural` is not a function).

## Contributing

There's always room for improvement. Feel free to contribute!

## Licensing

The library is licensed under MIT License. Check the license file for more details.
