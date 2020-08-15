# Configure romcal

## Usage

Invoke the `calendarFor` method to retrieve an `Array` of `LiturgicalDay` objects in the Roman Calendar (by default: one object per each day of the year).
This method accepts an object of configuration properties to obtain customized output.

```javascript
Romcal.calendarFor({
  year: 2020,
  country: 'unitedStates',
  locale: 'en',
  epiphanyOnSunday: true | false,
  corpusChristiOnSunday: true | false,
  ascensionOnSunday: true | false,
  outputOptionalMemorials: true | false,
  scope: 'gregorian' | 'liturgical',
});
```

romcal can be invoked without parameters or via shorthand properties like so:

```javascript
// Get calendar year dates (1st Jan - 31st Dec) for the current year
Romcal.calendarFor();

// Get calendar year dates for the specified year
Romcal.calendarFor(2020);
```

## Configuration Options

### `year`

Retrieve calendar dates for the given year (year should be an integer).
Defaults to the current system year if not specified.

### `country`

Include celebration dates requested by the Episcopal council(s) of the given country that were approved by the Holy See.
If not specified, no National dates are included in the calendar output.
If an unrecognized country is specified, romcal will silently ignore the property and will not return any National dates in the calendar output.
Country names should be specified in camel case (i.e. `unitedStates`, `czechRepublic`).

### `locale`

Defaults to `en` (English) if not set.
romcal celebration names can be localized to different languages.
If a given locale does not have the localized name for a celebration in that language, romcal will fall back to use the celebration name in the base language (if a region was specified in the locale), and finally in English.
More details on locales management in the [localization](#localization).

### `epiphanyOnSunday`

A `boolean` which define:

- `true`: Epiphany is celebrated a Sunday between the 2nd - 8th January based on the missal rules.
- `false`: Epiphany is traditionally celebrated on January 6th.

Defaults to `true` (Epiphany is always celebrated a Sunday).
Or if provided, defaults to the setting defined in the particular calendar you are fetching through romcal.

### `corpusChristiOnSunday`

A `boolean` which define:

- `true`: Corpus Christi is celebrated on Sunday (1 week before Pentecost)
- `false`: Corpus Christi is traditionally celebrated the Thursday of the 7th week of Easter (60 days after Easter).

Defaults to `true` (Corpus Christi is celebrated on Sunday by default).
Or if provided, defaults to the setting defined in the particular calendar you are fetching through romcal.

### `ascensionOnSunday`

A `boolean` which define:

- `true`: Ascension replace the 7th Sunday of Easter (42 days after Easter).
- `false`: Ascension is traditionally celebrated on Thursday, 39 days after Easter.

Defaults to `false` (Ascension is celebrated on Thursday by default).
Or if provided, defaults to the setting defined in the particular calendar you are fetching through romcal.

### `outputOptionalMemorials`

- `true`: in the romcal output, also includes optional celebrations and commemorations that could be celebrated on each day (in addition to the weekday).
- `false`: romcal output strictly one celebration per day, according to the calendar definitions and the missal rules. So you will get exactly 365 celebrations within a gregorian scope (366 on leap years).

Defaults to `false`.

### `scope`

Determines the scope of calendar output. The scope can be specified either as:

- `gregorian`: i.e. the [civil year](https://en.wikipedia.org/wiki/Civil_calendar) for the majority of countries - `January 1` to `December 31`.
- `liturgical`: the liturgical year - `1st Sunday of Advent` to the `last Saturday or Ordinary Time` (i.e. the last day before the following `1st Sunday of Advent` of the next liturgical year).

Defaults to `gregorian`.

Note that a `liturgical` year is always straddling two `gregorian` years.
In this situation, the `year` property always correspond with the beginning of the liturgical year.
So if you aim to fetch a liturgical calendar for `2030`, you will end up with celebration dates from `December 1 of 2030` to `November 29 of 2031`.

### `query`

A nested query object which filters the dates according to the given criteria.
For more details on how to use queries, see [Queries](#queries) section.
