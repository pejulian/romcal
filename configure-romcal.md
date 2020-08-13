# Configure romcal

## Usage

Invoke the `calendarFor` method to retrieve an array of liturgical dates and celebrations in the Roman Calendar.
This method accepts an object of configuration properties to obtain customized output.

```javascript
romcal.calendarFor({
  year: 2020,
  country: 'unitedStates',
  locale: 'en',
  epiphanyOnSunday: true | false,
  corpusChristiOnSunday: true | false,
  ascensionOnSunday: true | false,
  outputOptionalMemorials: true | false,
  scope: 'calendar' | 'liturgical',
});
```

romcal can be invoked without parameters or via shorthand properties like so:

```javascript
// Get calendar year dates (1st Jan - 31st Dec) for the current year
romcal.calendarFor();

// Get calendar year dates for the specified year
romcal.calendarFor(2020);
```

## Configuration Options

- `year`: Retrieve calendar dates for the given year (year should be an integer). Defaults to the current system year if not specified
- `country`: Include celebration dates requested by the Episcopal council(s) of the given country that were approved by the Holy See. If not specified, no National dates are included in the calendar output. If an unrecognized country is specified, romcal will silently ignore the property and will not return any National dates in the calendar output. Country names should be specified in camel case (i.e. `unitedStates`, `czechRepublic`).
- `locale`: Defaults to `en` (English) if not set. romcal celebration names can be localized to different languages. If a given locale does not have the localized name for a celebration in that language, romcal will fall back to use the celebration name in the base language (if a region was specified in the locale), and finally in English. More details on locales management in the [localization](#localization).
- `epiphanyOnSunday`: If `false`, fixes Epiphany on January 6th. Usually, Epiphany will be set to a Sunday between the 2nd - 8th Jan based on an internal calculation. Defaults to `true`.
- `corpusChristiOnSunday`: Determines if Corpus Christi should be celebrated on Sunday (63 days after Easter) or on Thursday of the 7th week of Easter (60 days after Easter). Defaults to `true` (Corpus Christi is celebrated on Sunday by default).
- `ascensionOnSunday`: Determines if Ascension should replace the 7th Sunday of Easter (42 days after Easter). Defaults to `false` where Ascension will be on Thursday, 39 days after Easter, if value not recognized or specified.
- `outputOptionalMemorials`: If `true`, also includes optional celebrations that could be celebrated on each day: optional memorials or commemorations. Defaults to `false`.
- `scope`: Determines the scope of calendar output. Can either be `liturgical` or `calendar`. Defaults to `calendar` if value not recognized or specified. The `liturgical` year runs from 1st Sunday of Advent of the given year to Saturday of the 34th Week of Ordinary Time in the following year. The civil year on the other hand refers to the standard year from Jan 1 - Dec 31.
- `query`: A nested query object which filters the dates according to the given criteria. For more details on how to use queries, see [Queries](#queries) section.
