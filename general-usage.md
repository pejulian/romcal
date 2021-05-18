# General use of romcal

- [Get calendar data](#get-calendar-data)
- [Get a specific liturgical date](#get-a-specific-liturgical-date)
- [Configuration options](#configuration-options)
- [Refines and filter results by criteria](#refines-and-filter-results-by-criteria)
  - [Filter by any criteria](#filter-by-any-criteria)
  - [Filter by date](#filter-by-date)
  - [Other utility methods on calendar results](#other-utility-methods-on-calendar-results)
- [Group results by criteria](#group-results-by-criteria)

## Get calendar data

Invoke the `.calendarFor` method to retrieve an `Array` of `LiturgicalDay` objects in the Roman Calendar (by default: one object per each day of the year).
This method accepts an optional object of configuration properties to obtain customized output.

```javascript
// Type: async calendarFor(options?: BaseRomcalConfig): Promise<RomcalCalendar>

Romcal.calendarFor({
  year: 2020,
  scope: 'gregorian' | 'liturgical',
  country: 'unitedStates',
  locale: 'en',
  epiphanyOnSunday: true | false,
  corpusChristiOnSunday: true | false,
  ascensionOnSunday: true | false,
  strictMode: true | false,
  verbose: true | false,
  prettyPrint: true | false,
});
```

romcal can be invoked without parameters or via shorthand properties like so:

```javascript
// Get calendar year dates (1st Jan - 31st Dec) for the current year
Romcal.calendarFor();

// Get calendar year dates for the specified year
Romcal.calendarFor(2020);
```

Then, the `calendarFor`method will produce an `Array` of `LiturgicalDay` objects (by default, one object per each day of the year, except if you specified to also output optional memorials).
For further information: :books: [Output data and JSON schema](docs/data-output.md).

Note that romcal always produce data **asynchronously**:

```javascript
// Access data using a Promise
Romcal.calendarFor({ year: 2020, locale: 'en' }).then(function (myCalendar1) {
  console.log(myCalendar1);
});

// Or access data using async/await
const myCalendar2 = await Romcal.calendarFor({ year: 2020, locale: 'en' });
console.log(myCalendar2);
```

## Get a specific liturgical date

Invoke the `.liturgicalDayFor` method to retrieve the data of a specific liturgical day.
This method accepts a first `Date` object parameter, and an optional object of configuration properties to obtain customized output.

```javascript
// Type: async liturgicalDayFor(date: Date, options?: BaseRomcalConfigWithoutYear): Promise<RomcalCalendar>

Romcal.liturgicalDayFor(date, {
  country: 'unitedStates',
  locale: 'en',
  epiphanyOnSunday: true | false,
  corpusChristiOnSunday: true | false,
  ascensionOnSunday: true | false,
  strictMode: true | false,
  verbose: true | false,
  prettyPrint: true | false,
});
```

This returns an `Array` containing first the relevant `LiturgicalDay` object, followed by optional memorials or commemorations objects that also match the provided `date` parameter.
If the `strictMode` option is set to `true`, romcal strictly output the more relevant `LiturgicalDay` object, so only one object per day.

e.g. to obtain today's liturgical day:

```javascript
// Using a Promise
Romcal.liturgicalDayFor(new Date(), {
  country: 'france',
  locale: 'fr',
}).then(function (today) {
  console.log(today);
});

// Or using async/await
const today = async Romcal.liturgicalDayFor(new Date(), {
  country: 'france',
  locale: 'fr',
});
console.log(today);
```

Note that under the hood, romcal always compute data for a whole liturgical year.
This is necessary to ensure that the right liturgical day is computed for every date:
each liturgical day is depending on the proper of seasons or the sanctorale, and might be defined according to each other (including all [moveable feast](https://en.wikipedia.org/wiki/Moveable_feast)).

:warning: For performance reasons, if you need to retrieve data from different dates in the same year, it will be highly recommended computing once a calendar (using the `.calendarFor` method), and then use the filtering methods to get all the desired dates.

## Configuration options

### `year`

An `integer` that defines the calendar year to compute.

Note: if the output `scope` is defined as a `liturgical` calendar, the `year` property refer to the main period of the liturgical calendar.
See just below for more details.

Default: current system year.

### `scope`

Defines the scope of calendar output. The scope can be specified either as:

- `gregorian`: i.e. the [civil year](https://en.wikipedia.org/wiki/Civil_calendar) for the majority of countries - `January 1` to `December 31`.
- `liturgical`: the liturgical year - `1st Sunday of Advent` to the `last Saturday or Ordinary Time` (i.e. the last day before the following `1st Sunday of Advent` of the next liturgical year).

Default: `gregorian`.

Note that a `liturgical` year is always straddling two `gregorian` years.
In this situation, the `year` property always refers to the main part of the liturgical year.
So if you aim to fetch a liturgical calendar for `2030`, you will end up with liturgical days from `December 2 of 2029` to `November 30 of 2030`.

### `country`

Include liturgical days requested by the Episcopal Council(s) of the given country that were approved by the Holy See.
If not specified, no National dates are included in the calendar output.
If an unrecognized country is specified, romcal will silently ignore the property and will not return any National dates in the calendar output.
Country names should be specified in camel case (i.e. `unitedStates`, `czechRepublic`).

Default: `general`.

### `locale`

romcal liturgical day names can be localized to different languages.
If a given locale does not have the localized name for a liturgical day in that language, romcal will fall back to use the liturgical day name in the base language (if a region was specified in the locale), and finally in English.
More details on locales management in the :books: [localization page](./localization.md).

Default: `en`.

### `epiphanyOnSunday`

A `boolean` which define:

- `true`: Epiphany is celebrated a Sunday between the 2nd - 8th January based on the missal rules.
- `false`: Epiphany is traditionally celebrated on January 6th.

Default:

- `true` (Epiphany is always celebrated a Sunday).
- Or if provided, defaults to the setting defined in the particular calendar you are fetching through romcal.

### `corpusChristiOnSunday`

A `boolean` which define:

- `true`: Corpus Christi is celebrated on Sunday (1 week before Pentecost)
- `false`: Corpus Christi is traditionally celebrated the Thursday after Trinity Sunday (60 days after Easter).

Default:

- `true` (Corpus Christi is celebrated on Sunday by default).
- Or if provided, defaults to the setting defined in the particular calendar you are fetching through romcal.

### `ascensionOnSunday`

A `boolean` which define:

- `true`: Ascension replace the 7th Sunday of Easter (42 days after Easter).
- `false`: Ascension is traditionally celebrated on Thursday, the 40th day of Easter.

Default:

- `false` (Ascension is celebrated on Thursday by default).
- Or if provided, defaults to the setting defined in the particular calendar you are fetching through romcal.

### `strictMode`

- `true`: strictly output one liturgical day per date, according to the calendar definitions and the missal rules. So you will get exactly 365 liturgical days within a Gregorian scope (366 in leap years).
- `false`: also outputs optional liturgical days and commemorations that could be celebrated on each day (in addition to the weekday). The more relevant liturgical day object is output first in the array.

Default: `false`.

### `verbose`

Enable logging output from romcal.
Logs are newline delimited JSON (NDJSON), a convenient format for production usage and long-term storage.

Default: `false`.

### `prettyPrint`

Prettify logs printed in the console, for a better experience in development environnements (instead of output them in NDJSON format).

Default: `false`.

## Refines and filter results by criteria

Under the hood, romcal always compute data for a whole liturgical year.
This is necessary to ensure that the right liturgical day is computed for every date:
each liturgical day is depending on the proper of seasons or the sanctorale, and might be defined according to each other (including all [moveable feast](https://en.wikipedia.org/wiki/Moveable_feast)).

Then, all liturgical days are gathered into a calendar object, and exported within the scope of a Gregorian or a liturgical year.
It produces a `RomcalCalendar` object, which is an `Array` of `LiturgicalDay` objects (by default, one object per each day of the year, except if you specified to also output optional memorials).

### Filter by any criteria

JavaScript already offers all the tooling to filter an array of objects, and by any specific criteria. Some examples below:

```javascript
Romcal.calendarFor({ year: 2020, locale: 'en' }).then((calendar) => {
  // Get all Sunday occurring during the year
  // (Sunday = 0 ... Saturday = 6)
  var allSundays = calendar.filter((day) => new Date(day.date).getUTCDay() === 0);

  // Get all liturgical days in February
  // (January = 0 ... December = 11)
  var february = calendar.filter((day) => new Date(day.date).getUTCMonth() === 1);

  // Get all Feasts occurring during the year
  var allFeasts = calendar.filter((day) => day.rank === 'FEAST');

  // Get all liturgical days that commemorate a martyr
  var martyrs = calendar.filter((day) => day.metadata.titles.includes('MARTYR'));
});
```

### Filter by date

For convenient usage, romcal also provides additional methods to filter the liturgical days by date criteria.

- `.getDaysBefore`
- `.getDaysSameOrBefore`
- `.getLiturgicalDay`
- `.getDaysSameOrAfter`
- `.getDaysAfter`

All these methods, takes 1 parameter: `dateOrKey`, that could be either a `Date` object, or the `key` of a liturgical day (romcal will lookup the corresponding `date` from this liturgical day).

This returns a new `RomcalCalendar` array of `LiturgicalDays`. If no elements pass the test, or the provided criteria don't match any liturgical days from the calendar, an empty array will be returned.

#### → Days before a date: `.getDaysBefore(dateOrKey)`

Get all liturgical days that are before the provided criteria.

```javascript
// Types: getDaysBefore(dateOrKey: Date | string): RomcalCalendar

var daysBeforeToday = (await Romcal.calendarFor()).getDaysBefore(new Date());
var daysBeforeEaster = (await Romcal.calendarFor()).getDaysBefore('easter_sunday');
```

#### → Days same or before a date `.getDaysSameOrBefore`

Get all liturgical days that match or are before the provided criteria.

```javascript
// Types: getDaysSameOrBefore(dateOrKey: Date | string): RomcalCalendar

var todayAndDaysBefore = (await Romcal.calendarFor()).getDaysSameOrBefore(new Date());
var easterAndDaysBefore = (await Romcal.calendarFor()).getDaysSameOrBefore('easter_sunday');
```

#### → A specific day for a date `.getLiturgicalDay`

Get the liturgical day(s) that match the provided criteria.

If the `strictMode` is set to `true`, you will obtain strictly on item per day. Optional memorials or commemorations are not outputted.

```javascript
// Types: getLiturgicalDay(dateOrKey: Date | string): RomcalCalendar

var today = (await Romcal.calendarFor()).getLiturgicalDay(new Date());
var easterSunday = (await Romcal.calendarFor()).getLiturgicalDay('easter_sunday');
```

#### → Days same or after a date `.getDaysSameOrAfter`

Get all liturgical days that match or are after the provided criteria.

```javascript
// Types: getDaysSameOrBefore(dateOrKey: Date | string): RomcalCalendar

var todayAndDaysAfter = (await Romcal.calendarFor()).getDaysSameOrAfter(new Date());
var easterAndDaysAfter = (await Romcal.calendarFor()).getDaysSameOrAfter('easter_sunday');
```

#### → Days after a date `.getDaysAfter`

Get all liturgical days that are after the provided criteria.

```javascript
// Types: getDaysAfter(dateOrKey: Date | string): RomcalCalendar

var todayAndDaysBefore = (await Romcal.calendarFor()).getDaysAfter(new Date());
var easterAndDaysBefore = (await Romcal.calendarFor()).getDaysAfter('easter_sunday');
```

#### → Chain filter methods

It is possible to chain multiple filter methods.

```javascript
var calendar = await Romcal.calendarFor();
var daysInAdvent = calendar.getDaysSameOrAfter('advent_1_sunday').getDaysBefore('christmas');
```

### Other utility methods on calendar results

#### → Has a liturgical day `.hasLiturgicalDay(dateOrKey)`

Validate if the date has a matching liturgical day within a romcal calendar.

- `dateOrKey`: a `Date` object, or the `key` of a liturgical day
- Returns `true` if a matching liturgical day is found within the `RomcalCalendar` array. Or `false` if not found.

```javascript
// Types: hasLiturgicalDay(dateOrKey: Date | string): boolean

var calendar = await Romcal.calendarFor();
var hasToday = calendar.hasLiturgicalDay(new Date()); // true
var hasEaster = calendar.getDaysAfter('easter_sunday').hasLiturgicalDay('easter_sunday'); // false
```

#### → Get a date within a calendar `.getDate(dateOrKey)`

Get a validated `Date` within a romcal calendar, or `undefined` if no matching day is found.

- `dateOrKey`: a `Date` object, or the `key` of a liturgical day
- Returns the `Date` of the found liturgical day within the `RomcalCalendar` array. Or `undefined` if the matching liturgical day is not found.

```javascript
// Types: getDate(dateOrKey: Date | string): Date | undefined

var calendar = await Romcal.calendarFor({ year: 2020 });

// January 1 of 2019 is not part of the computed calendar for 2020
var firstJanuaryOf2019 = calendar.getDate(new Date(2019, 0, 1)); // undefined

// These 2 days are part of the computed calendar for 2020
var firstJanuaryOf2020 = calendar.getDate(new Date(2020, 0, 1)); // "2020-01-01T00:00:00.000Z"
var easterDate = calendar.getDate('easter_sunday'); // "2020-04-12T00:00:00.000Z"
```

## Group results by criteria

#### → Group by a predefined criteria `.groupBy(criteria)`

romcal offers a convenient way to group data by various criteria. The supported criteria are:

`days` | `months` | `daysByMonth` | `weeksByMonth` | `sundayCycles` | `weekdayCycles` | `ranks` | `liturgicalSeasons` | `liturgicalColors` | `psalterWeeks`

For example:

```javascript
Romcal.calendarFor({ year: 2020, locale: 'en' }).then((calendar) => {
  const byRanks = calendar.groupBy('ranks');
  console.log(byRanks);
});
```

Will produce this dictionary of array:

```json5
{
  WEEKDAY: [ ... ],
  SUNDAY: [ ... ],
  MEMORIAL: [ ... ],
  FEAST: [ ... ],
  SOLEMNITY: [ ... ],
  // ...
}
```

#### → Group by any criteria

For any custom needs, we recommend using the native `.reduce` method on `Array` to get similar results than the `.groupBy` method.

For example below, grouping by `rank`:

```javascript
// Using JavaScript and a Promise

Romcal.calendarFor({ year: 2020, locale: 'en' }).then((calendar) => {
  const byRanks = calendar.reduce((obj, item) => {
    const key = item.rank; // <-- the property by which you want to group liturgical days
    (obj[criteria] = obj[criteria] || new RomcalCalendar()).push(item);
    return obj;
  }, {});

  console.log(byRanks);
});
```

```typescript
// Using TypeScript and async/await

const calendar = await Romcal.calendarFor({ year: 2020, locale: 'en' });
const byRanks = calendar.reduce((obj: Dictionary<RomcalCalendar>, item: LiturgicalDay) => {
  const criteria = item.rank; // <-- the property by which you want to group liturgical days
  (obj[criteria] = obj[criteria] || new RomcalCalendar()).push(item);
  return obj;
}, {});

console.log(byRanks);
```
