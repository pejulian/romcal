# Manipulate and refining data results

- [Queries](#queries)
  - [Filtering calendar output by months of year or day of week](#filter-by-months-or-day)
  - [Grouping calendar output by criteria](#grouping-by-criteria)
  - [Filtering calendar output by celebration title metadata](#filter-by-title)
  - [Filtering calendar output by celebration title metadata](#filter-by-title)
- [Multiple queries](#Multiple queries)

## Queries

romcal can generate filtered liturgical or calendar year dates by:

- passing an additional query object along with the initial configuration object to the `calendarFor` method, or
- invoking the `queryFor` method and supplying an array of dates generated from `calendarFor` and a query object

### Filtering calendar output by months of year or day of week <a name="filter-by-months-or-day"></a>

```javascript
import { Calendar } from 'romcal';

Calendar.calendarFor({
  query: {
    month: 0, // 0 - 11 (Jan = 0, Dec = 11)
  },
});

Calendar.calendarFor({
  query: {
    day: 0, // 0 - 6 (0 = Sunday, 6 = Saturday)
  },
});
```

or

```javascript
import { Calendar } from 'romcal';

let dates = Calendar.calendarFor();

let datesGroupedByDay = Calendar.queryFor(dates, {
  day: 0, // 0 - 6
});

let datesGroupedByMonth = Calendar.queryFor(dates, {
  month: 0, // 0 - 11
});
```

### Grouping calendar output by criteria <a name="grouping-by-criteria"></a>

Calendar dates can be grouped by various criteria upon invocation like so:

```javascript
import { Calendar } from 'romcal';

Calendar.calendarFor({
  query: {
    group:
      'days|months|daysByMonth|weeksByMonth|sundayCycles|weekdayCycles|ranks|liturgicalSeasons|liturgicalColors|psalterWeeks',
  },
});
```

Or invoking the query function at a later point

```javascript
import { Calendar } from 'romcal';

let dates = Calendar.calendarFor();

// Some code,
// then ...

let groupedCalendar = Calendar.queryFor(dates, {
  group:
    'days|months|daysByMonth|weeksByMonth|sundayCycles|weekdayCycles|ranks|liturgicalSeasons|liturgicalColors|psalterWeeks',
});
```

### Filtering calendar output by celebration title metadata <a name="filter-by-title"></a>

```javascript
romcal.calendarFor({
  query: {
    title: 'PATRON_OF_EUROPE',
  },
});
```

Other possible values can be checked [here](#titles).

## Multiple queries

It is possible to query for dates against multiple criteria:

```javascript
// Filter dates in January and group the results according to days
romcal.queryFor(dates, {
  month: 0,
  group: 'days',
});
```
