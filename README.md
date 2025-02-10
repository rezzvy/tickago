# TickAgo

## Overview

A JavaScript library to calculate and compare elapsed time.

- Automatically detects elapsed time: seconds, minutes, hours, months, or years ago.
- Compare two times and get the elapsed time object.
- Customizable and flexible.
- And more to explore!

## How it Works

It works by getting the given date and calculating the elapsed time.

## Installation

1. Include the source file in your project, either manually or by using our CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/rezzvy/tickago@latest/dist/tickago.min.js"></script>
```

_or if you're in node environment_

```
npm install tickago
```

2. Assuming you're in a browser environment, you can use the library by calling the method directly `TickAgo.{methodName}`

_or if you're in node environment, you need to require it first._

```javascript
const TickAgo = require("tickago");
```

## Usage

### `moment()` method

```javascript
// Given parameter as a Date object
console.log(TickAgo.moment(new Date("2011-11-11"))); // Expected output: {x} years ago
// Given parameter as a timestamp
console.log(TickAgo.moment(Date.now() - 5000)); // Expected output: 5 sec ago
// Given parameter as a string
console.log(TickAgo.moment("2011-11-11")); // Expected output: {x} years ago

// Another examples
console.log(
  TickAgo.moment(Date.now() - 5000, {
    labels: {
      sec: "detik yang lalu",
    },
  })
); // Expected output: 5 detik yang lalu (indonesian)

console.log(
  TickAgo.moment("11-2011-11", {
    format: "DD-YYYY-MM",
  })
); // Expected output: {x} years ago
```

### `compare()` method

```javascript
 // Given parameters as strings
console.log(TickAgo.compare("2015-01-01", "2025-01-01"));
// Expected Output
{
    "years": 10,
    "months": 0,
    "days": 0,
    "hours": 0,
    "minutes": 0,
    "seconds": 0,
    "elapsedTime": 315619200000
}

// A mix of string and timestamp
console.log(TickAgo.compare("2015-01-01", Date.now())); // Current timestamp 1738479393395
// Expected Output
{
    "years": 10,
    "months": 1,
    "days": 1,
    "hours": 6,
    "minutes": 56,
    "seconds": 33,
    "elapsedTime": 318408993395
}

// Using custom date format
console.log(TickAgo.compare("11-2011-11", "12-2012-12", "MM-YYYY-DD"));
// Expected Output
{
    "years": 1,
    "months": 1,
    "days": 1,
    "hours": 0,
    "minutes": 0,
    "seconds": 0,
    "elapsedTime": 34300800000
}
```

## Documentation

### `moment(timestamp, options)` method

- **First parameter**
  Expected to be a string, timestamp, or date object. If the given value is a date object, the custom date format will be ignored, and the date object will be used as it is.

- **Second parameter (_optional_)**

```javascript
{
  format: "DD-MM-YYYY", // DD as Day, MM as month, YYYY as year
  labels: {
    sec: "sec ago",
    minutes: "minutes ago",
    hours: "hours ago",
    days: "days ago",
    months: "months ago",
    years: "years ago"
  }
}
```

### `compare(dateOne, dateTwo, format)` method

> [!NOTE]  
> If the given value contains only the `day, month, and year`, the `hours, minutes, and seconds` will always be zero. To make it work, you can pass the time in the given date, e.g., `2012-12-12T19:29`, or manually create a date object and set the hours and minutes.

- **First and second parameters**  
  Expected to be a string, timestamp, or date object. If the given value is a date object, the custom date format will be ignored, and the date object will be used as it is.

- **Third parameter (_optional_)**  
  Expected to be a string, e.g., `YYYY-MM-DD`.

## Contributing

There's always room for improvement. Feel free to contribute!

## Licensing

The library is licensed under MIT License. Check the license file for more details.
