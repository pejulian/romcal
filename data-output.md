# Output data and JSON schema

- [JSON Structure](#json-structure)
- [Celebration Ranks](#celebration-ranks)
- [Celebration Titles](#celebration-titles)
- [Liturgical Seasons](#liturgical-seasons)
- [Liturgical Periods](#liturgical-periods)
- [Liturgical Cycles: Years and Weeks](#cycles)
  - [Sunday Cycle](#sunday-cycle)
  - [Weekday Cycle](#weekday-cycle)
  - [Psalter Weeks](#psalter-weeks)
- [Liturgical Colors](#liturgical-colors)
- [Calendar Sources [deprecated]](#calendar-sources-deprecated)

## JSON Structure

romcal returns an array of liturgical date objects in the following structure

```json5
[
  {
    key: 'maryMotherOfGod',
    name: 'Mary, Mother of God',
    date: '2020-01-01T00:00:00.000Z',
    rank: 'SOLEMNITY',
    prioritized: false,
    liturgicalColors: ['WHITE'],
    seasons: ['CHRISTMASTIDE'],
    seasonNames: ['Christmas'],
    periods: ['CHRISTMAS_OCTAVE'],
    cycles: {
      sundayCycle: 'YEAR_A',
      weekdayCycle: 'YEAR_2',
      psalterWeek: 'WEEK_2',
    },
    calendar: {
      totalWeeksInGregorianYear: 53,
      totalWeeksInLiturgicalYear: 52,
      weekOfGregorianYear: 1,
      weekOfLiturgicalYear: 5,
      weekOfSeason: 2,
      dayOfGregorianYear: 1,
      dayOfLiturgicalYear: 32,
      dayOfSeason: 8,
      dayOfWeek: 3,
      dayOfWeekCountInMonth: 1,
      startOfLiturgicalYear: '2019-12-01T00:00:00.000Z',
      endOfLiturgicalYear: '2020-11-28T00:00:00.000Z',
      easter: '2020-04-12T00:00:00.000Z',
    },
    fromCalendar: 'general',
    metadata: {
      titles: [],
    },
  },
  // ...
]
```

- `key`: A camel case string which serves as a unique identifier for the celebration.
- `name`: The [localisable name](localization.md) of the celebration
- `date`: Date of the celebration as a ISO8601 string
- `rank`: A key representing the [celebration rank](#celebration-ranks)
- `prioritized`: A optional boolean that when true, gives the celebration higher priority over another coinciding celebration even though that celebration has a higher ranking type. This flag should be used with caution.
- `liturgicalColors`: The [liturgical color(s)](#liturgical-colors) assigned for this celebration (usually follows the liturgical season but may defer if this celebration is a solemnity, feast or memorial)
- `seasons`: Required: An array of string that identifies the liturgical season this celebration belongs to
- `seasonNames`: Required: An array of localized string that identifies the liturgical season this celebration belongs to
- `periods`: Required: An array ofstring that identifies the liturgical period this celebration belongs to
- `cycles`: The [liturgical cycle](#cycles) metadata of the celebration
- `calendar`: The liturgical calendar metadata of the celebration
- `fromCalendar`: Name of the calendar from which the celebration is defined
- `metadata`: An object that holds additional information about the celebration, especially related to the celebration from the Sanctoral or Martyrology.
  - `titles`: An array of [titles](#titles) that may be assigned to this celebration

## Celebration Ranks

Each date in the liturgical calendar is assigned a rank which are:

1. `SOLEMNITY`
2. `SUNDAY`
3. `TRIDUUM`
4. `HOLY_WEEK`
5. `FEAST`
6. `MEMORIAL`
7. `OPT_MEMORIAL`
8. `COMMEMORATION`
9. `WEEKDAY`

Where the importance or rank of the celebration is in descending order (Solemnity being of highest importance and weekday being the lowest).

Types play an important role in determining which celebration should take precedence over another when two or more celebrations coincide on the same date. Certain celebration types will also have different liturgical colors applied to them.

The array of types can be imported into consumer apps via:

```javascript
import { Types } from 'romcal';
```

## Celebration Titles

On top of having a celebration type, liturgical dates may also have one or more titles of significance assigned to it.

For example, the feast of [Saint Catherine of Siena](https://en.wikipedia.org/wiki/Catherine_of_Siena) is assigned the titles `PATRON_OF_EUROPE` (for national calendars of countries in Europe only) and `DOCTOR_OF_THE_CHURCH` due to those titles being conferred on her by the Church.

Titles are currently available for:

- `PATRON_OF_EUROPE`
- `FEAST_OF_THE_LORD`
- `DOCTOR_OF_THE_CHURCH`
- `MARIAN_FEAST`
- `TRIDUUM`
- `MARTYR`

The titles object can be imported into consumer apps via:

_ES6_

```javascript
import { Titles } from 'romcal';
```

_CommonJS_

```javascript
var Titles = require('romcal').Titles;
```

## Liturgical Seasons

The liturgical calendar is divided into various seasons that occur throughout the liturgical year.

- `ADVENT`
- `CHRISTMASTIDE`
- `ORDINARY_TIME`
- `LENT`
- `PASCHAL_TRIDUUM`
- `EASTERTIDE`

romcal assigns seasons to the dates it generates to indicate the season to which the range of dates generated belong.

The LITURGICAL_SEASONS object can be imported into consumer apps via:

_ES6_

```javascript
import { LITURGICAL_SEASONS } from 'romcal';
```

_CommonJS_

```javascript
var LITURGICAL_SEASONS = require('romcal').LITURGICAL_SEASONS;
```

## Liturgical Periods

In addition to seasons, romcal give information about periods for each date.

Available liturgical periods:
- `CHRISTMAS_OCTAVE`
- `HOLY_WEEK`
- `EASTER_OCTAVE`

Other periods (non-official), some of which are from the tradition of the church (often still used in monastic liturgies), for convenient usage only:
- `DAYS_BEFORE_EPIPHANY`
- `DAYS_AFTER_EPIPHANY`
- `CHRISTMAS_TO_PRESENTATION_OF_THE_LORD`
- `PRESENTATION_OF_THE_LORD_TO_HOLY_THURSDAY`
- `EARLY_ORDINARY_TIME`
- `LATER_ORDINARY_TIME`

The LITURGICAL_PERIODS object can be imported into consumer apps via:

_ES6_

```javascript
import { LITURGICAL_PERIODS } from 'romcal';
```

_CommonJS_

```javascript
var LITURGICAL_PERIODS = require('romcal').LITURGICAL_PERIODS;
```

## Liturgical Cycles: Years and Weeks <a name="cycles"></a>

A liturgical year consists of cycles that determines which portions of scripture are to be read.
And inside every liturgical year, another psalter week cycle will determine which psalms and prayer to follow for the liturgy of hours.

Romcal automatically calculates the correct cycles for the given liturgical date.
Cycle information can be read via the `dates[idx].cycles` property in each date element in the array that `calendarFor` returns:

```typescript
{
  sundayCycle: 'YEAR_A' | 'YEAR_B' | 'YEAR_C';
  weekdayCycle: 'YEAR_1' | 'YEAR_2';
  psalterWeek: 'WEEK_1' | 'WEEK_2' | 'WEEK_3' | 'WEEK_4';
}
```

### Sunday Cycle

Sunday cycle are used mainly for sunday readings, and some solemnity.

- `Year A` denoted by the key `YEAR_A`
- `Year B` denoted by the key `YEAR_B`
- `Year C` denoted by the key `YEAR_C`

### Weekday Cycle

Weekday cycle are used mainly for weekdays readings.

- `Year 1` or `Odd year` denoted by the key `YEAR_1`
- `Year 2` or `Even year` denoted by the key `YEAR_2`

### Psalter Weeks

With the exception of the Easter Octave, each week in the liturgical year is assigned readings from the [Psalter](https://en.wikipedia.org/wiki/Roman_Breviary#The_Psalter).
The psalter week cycle is composed of a repeated sequence of 4 four weeks. It restarts at the beginning of each season.
There are also some rules that govern the set of Psalter readings used on particular occasions or seasons of the year.

For convenient usage, romcal provides the psalter week number for all seasons:

- `Week I` denoted by the key `WEEK_1`
- `Week II` denoted by the key `WEEK_2`
- `Week III` denoted by the key `WEEK_3`
- `Week IV` denoted by the key `WEEK_4`

---

The cycle objects can be imported into consumer apps via:

_ES6_

```javascript
import { LITURGICAL_SUNDAY_CYCLES, LITURGICAL_WEEKDAY_CYCLES, PSALTER_WEEKS } from 'romcal';
```

_CommonJS_

```javascript
var LITURGICAL_SUNDAY_CYCLES = require('romcal').LITURGICAL_SUNDAY_CYCLES;
var LITURGICAL_WEEKDAY_CYCLES = require('romcal').LITURGICAL_WEEKDAY_CYCLES;
var PSALTER_WEEKS = require('romcal').PSALTER_WEEKS;
```

## Liturgical Colors

[Liturgical colours are those specific colours used for vestments and hangings within the context of Christian liturgy. The symbolism of violet, white, green, red, gold, black, rose and other colours may serve to underline moods appropriate to a season of the liturgical year or may highlight a special occasion.](https://en.wikipedia.org/wiki/Liturgical_colours)

romcal defines various liturgical colors in which are:

- `BLACK`
- `GOLD`
- `GREEN`
- `PURPLE`
- `RED`
- `ROSE`
- `WHITE`

More information on how these colors are used for celebration can be found [here](https://en.wikipedia.org/wiki/Liturgical_colours#Roman_Catholic_Church)

Liturgical colors can be read via the `dates[idx].data.meta.liturgicalColor` property in each date element in the array that `calendarFor` returns.

The `LITURGICAL_COLORS` object can be imported into consumer apps via:

_ES6_

```javascript
import { LITURGICAL_COLORS } from 'romcal';
```

_CommonJS_

```javascript
var LITURGICAL_COLORS = require('romcal').LITURGICAL_COLORS;
```

## Calendar sources [deprecated]

romcal generates dates that come from 4 different internal sources:

- `l` : liturgical
- `c` : celebrations
- `g` : general
- `n` : national

Each date is assigned a source with one of the four calendar sources above.

Calendar sources play an important role in how romcal manages coinciding dates (see [overriding dates](#overidding)).

### liturgical

Represents a standard date in the liturgical year. Dates from this source build the basic structure of the liturgical calendar from the start of the liturgical year to its end.

Dates from `src/lib/Seasons.js` will be assigned the source value `l`.

The module responsible for generating the `liturgical` dates is `src/lib/Seasons.js`. _It is unlikely that this module will need customization or overriding of any kind._

### celebrations

Represents central celebrations observed in the Roman Catholic rite. They take precedence and will replace coinciding dates from the `liturgical` calendar or `general` calendar.

Dates from `src/lib/Celebrations.js` will be assigned the source value `c`.

The module responsible for generating `celebrations` is `src/lib/Celebrations.js`. _It is highly unlikely that this module will need customization or overriding of any kind._

A prioritized date defined in the `national` calendar can replace a date in the `celebrations` calendar when:

- the key of the `national` date matches a key in `celebrations`
- the `national` date is prioritized

_In most cases, it is unlikely that a national calendar event will replace a celebration because of the significance of celebrations. If a national event must override a celebration date, it should be properly verified._

The following are a list of dates defined in the `celebrations` calendar:

- Immaculate Conception
- Christmas
- Mary Mother of God
- Epiphany
- Trinity Sunday
- Corpus Christi
- Sacred Heart of Jesus
- Birth of John the Baptist
- Peter and Paul, Apostles
- Assumption
- All Saints
- Christ the King
- Joseph, Husband of Mary
- Annunciation
- Easter
- Divine Mercy Sunday
- Ascension
- Pentecost Sunday
- Ash Wednesday
- Palm Sunday
- Holy Thursday
- Good Friday
- Holy Saturday
- Holy Family
- Baptism of the Lord
- Presentation of the Lord
- Transfiguration
- Triumph of the Cross
- Immaculate Heart of Mary

### general

Represents general celebrations throughout the liturgical year. Dates from the `general` calendar will override those from the `liturgical` calendar.

Dates from `src/calendars/general.js` are assigned the source value `g`.

The module responsible for generating the `general` dates is `src/lib/Calendars/general.js`.

`general` calendar dates will always be overwritten by `celebration` or `national` calendar dates even if they are prioritized. Celebrations in this calendar should reflect the General Roman Calendar, therefore there should be changes only when there is a change in the General Roman Calendar. When one wants to add, remove or modify a celebration that is celebrated only in a national calendar, they should make this changes in that particular calendar, not in the `general`.

In situations where a given celebration must override one in the general calendar, define it in the `national` calendar instead.

### national

Represents specific liturgical dates that were approved for use by the Holy See for a particular country. It can be used to define unique celebrations celebrated by that particular country or existing celebrations that were [transferred to another date](https://en.wikipedia.org/wiki/General_Roman_Calendar#Transfer_of_celebrations).

A prioritized celebration in the `national` calendar takes precedence over celebrations in `general`, `celebrations` and `liturgical` calendars. As such, this marker should be used with caution as it may cause national events to override important celebrations that should not be overridden.

In situations when there are 2 celebrations from a `national` calendar that coincide on the same date, the one with the higher ranking celebration type will take precedence.

A new `national` calendar for a country can be defined by creating a new `.js` file with the country name in upper case, lower case or camel case in the `src/lib/calendars` folder (i.e. `malaysia.mjs`). This new file will automatically be picked up by the module and will be used when the user supplies the matching key in the country argument in the `calendarFor` method.

Dates from `src/calendars/<countryName>.js` will be assigned the source key `n`

See [Overriding dates](#overridingDates) for more examples.
