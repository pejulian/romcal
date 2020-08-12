# Advanced usage and contributions

- [Overriding dates](#overriding-dates)
  - [Overriding a date by its calendar source [deprecated]](#overriding-a-date-by-its-calendar-source-deprecated)
  - [Overriding a date by its priority](#overriding-a-date-by-its-priority)
  - [Overriding a date by its key](#overriding-a-date-by-its-key)
- [Removing general dates in national calendar output](#removing-general-dates-in-national-calendar-output)
- [The `drop` keyword](#the-drop-keyword)
- [Localization helper](#localization-helper)

## Overriding dates

romcal is designed with extensibility in mind, to cater for unique scenarios that are common in the liturgical calendar.

### Overriding a date by its calendar source [deprecated]

The order of importance of calendar sources are: `celebrations` > `national` > `general` > `liturgical`.

### Overriding a date by its priority

Prioritizing a date allows it to:

- Override a higher ranking `type` date object with the same key
- Prevent it from being overridden by other coinciding dates

A date can be prioritized by adding `prioritized`: `true` to the `data` object in the given date object. See `src/lib/Celebrations.ts` for more examples.

All dates in `src/lib/Celebrations.ts` (Christmas, Easter) are prioritized as they must override any other date in the liturgical calendar and cannot be overridden by any other coinciding date regardless of rank **unless** the coinciding date is itself prioritized

For example, `allSaints` in `src/lib/Celebrations.ts` can be overridden by `allSaints` in `src/calendars/england.ts`) because the entry in that `national` calendar was set with `prioritized`: `true`.

> :warning: If a coinciding date’s source is from the `celebration` or `national` calendars, _but_ the prioritized date is defined in the `general` calendar, it _will still be_ overridden by the coinciding date because `celebration` and `national` calendar sources have higher precedence (see [Overriding a date by its calendar source](#overridingBySource) section).

### Overriding a date by its key

In most countries, All Saints and All Souls are always celebrated on the 1st and 2nd of November respectively. However, in England and Wales, if All Saints (1 November) falls on a Saturday, it is transferred to the Sunday and All Souls is transferred to Monday 3rd November.

romcal implements this unique difference by overriding the `allSouls` and `allSaints` celebrations in the national calendars of `src/calendars/england.ts` and `src/calendars/wales.ts` (the original definition was in `src/calendars/general.ts`). The overriding dates in these calendars define a IIFE callback function for the `date` property that holds logic for determining if the date should be moved.

Since national calendar dates have higher precedence than general calendar dates, the national date definitions for All Saints and All Souls will override the ones in the general calendar.

Also, since prioritized dates in the national calendar sources can override dates in celebration calendar sources, the date definitions for All Saints and All Souls will now be taken from the national calendar.

Therefore, it is important that the key in the national calendar is **exactly** the same as the one in the general calendar so that romcal recognizes it for overriding. Typos (even case mismatch), will cause unexpected results.

## Removing general dates in national calendar output

By default, romcal _does not_ remove any celebrations in its output. Instead, prioritization (see above) is the preferred way to go about overriding celebrations to exhibit different characteristics.

However, in some cases, a national calendar may need to omit a celebration entirely from its output. For example, the possible reasons could be:

- that the given celebration is entirely irrelevant to the observances of the nation;
- when a celebration of two or more saints are celebrated jointly in the `general` calendar, but separately in the national calendar;
- when a celebration of two or more saints are celebrated separately in the `general` calendar, but jointly in the national calendar.

romcal enables this flexibility via the `drop` key.

### The `drop` keyword

When defined, the `drop` key should contain a `boolean` value of `true` to indicate that the given celebration should be _removed_ from the calendar output.

Usually, this means excluding a celebration defined in `src/calendars/general.ts`. The construct would be defined in the relevant `national` calendar and look like this:

```javascript
{
  key: "",
  date: dayjs.utc(),
  drop: true
}
```

> When defining `drop`, only the `key` and `date` properties of the celebration are mandatory. Other keys do not have to be defined. `drop` operations also have higher precedence than overriding (meaning, they are run first before prioritization logic).

## Localization helper

romcal uses the utility function `Utils.localize()` to resolve the correct locale string based on the given key.
The function accepts several parameters:

```javascript
Utils.localize({
  key: '',
  week: 0,
  count: 0,
});
```

- `key`: A dot delimited string representing the locale key (`celebrations.christmas`)
- `week`: A non-zero integer for weeks which will be converted to its ordinal representation (1st Sunday of Advent)
- `count`: A non-zero integer for days which will be converted to its ordinal representation (2nd Sunday of Christmas)
