# Calendar definitions and contributions

- [Liturgical calendar building](#liturgical-calendar-building)
- [Particular calendars](#particular-calendars)
  - [Extending a liturgical day](#extending-a-liturgical-day)
  - [Overriding a date by its priority](#overriding-a-liturgical-day-by-its-priority)
  - [Overriding a date by its key](#overriding-a-liturgical-day-by-its-key)
  - [Overriding a liturgical day by its priority](#overriding-a-liturgical-day-by-its-priority)
  - [Removing general dates in national calendar output](#removing-liturgical-day-of-the-general-calendar-in-particular-calendar-output)
    - [The `drop` keyword](#the-drop-keyword)

## Liturgical calendar building

romcal is designed with extensibility in mind, to cater for unique scenarios that are common in the liturgical calendar.

When computing a calendar, romcal will first compute the main calendar for all **seasons** (all Sundays and weekdays occurring the whole year).
This first calendar level is very important, it defines all the basic liturgical days, for every day of the year, including calendar metadata, cycles, seasons and periods within the year...

Then, the **General Roman calendar** (GRC) is computed and combined on top of the season calendar.
Finally, a **particular calendar** (for a country, a diocese...) could also be computed on top of the General Roman calendar.

romcal always computes data for a whole liturgical year.
This is necessary to ensure that the right liturgical day is well defined for every date:
each liturgical day is depending on the proper of seasons or the sanctorale, and might be defined according to each other (including all [moveable feast](https://en.wikipedia.org/wiki/Moveable_feast)).

When all liturgical days are computed by romcal, they are ordered by date, and sorted by their precedence rank.
On the same date, if a liturgical day has precedence on another liturgical day, romcal will only keep the relevant liturgical day.
By default, you will only get one liturgical day per date.

Output conforms to the revised liturgical calendar as approved by Paul VI in [Mysterii Paschalis](http://w2.vatican.va/content/paul-vi/en/motu_proprio/documents/hf_p-vi_motu-proprio_19690214_mysterii-paschalis.html) for the Roman Rite (post-Vatican II).
Rules followed by romcal are defined in the [_General Instruction on the Roman Missal_](https://www.catholicculture.org/culture/library/view.cfm?recnum=337) (GIRM) and the [_General Norms for the Liturgical Year and the Calendar_](https://www.catholicculture.org/culture/library/view.cfm?id=10842).


## Particular calendars

As well as the General Roman calendar, romcal allows defining various particular calendar, that could serve specific regions, countries, dioceses, parishes, communities...
Currently, only country calendars are proposed from this romcal project. In a near future we plan to propose diocesan calendars, and offer an easy way to extend romcal with any third calendars to support all your needs.

You will find below some indications on the available features, to contribute to maintaining and improving calendars into romcal.


### Extending a liturgical day

This is especially useful to update a liturgical day already defined in the `general` Roman calendar, without having to redefine it entirely in the particular calendar.

For example, Saint Gregory the Great is a memorial in the `general` Roman calendar, but is a feast in England.
In the `england` calendar, we will only define a new entry with its `key` and the `extend: true` option. Then we only add what is different in England (here, the `rank` raised to feast).

```json5
{
  key: 'saintGregoryTheGreatPopeAndDoctor',
  extend: true,
  rank: Ranks.FEAST,
}
```

It's generally a good practice to extend an existing liturgical day, with its specifications for a particular calendar, instead of redefining multiple time the same liturgical day in different calendars.


### Overriding a liturgical day by its key

In most countries, All Saints and All Souls are always celebrated on the 1st and 2nd of November respectively. However, in England and Wales, if All Saints (1 November) falls on a Saturday, it is transferred to the Sunday and All Souls is transferred to Monday 3rd November.

romcal implements this unique difference by overriding the `allSouls` and `allSaints` celebrations in the particular calendars of `src/calendars/england.ts` and `src/calendars/wales.ts` (the original definition was in `src/calendars/general.ts`). The overriding dates in these calendars define a IIFE callback function for the `date` property that holds logic for determining if the date should be moved.

Since liturgical day in particular calendars have higher precedence than liturgical days in general calendar, the days of the particular definitions for All Saints and All Souls will override the ones in the general calendar.

Also, since prioritized liturgical days in the particular calendar can override days in the general calendar, the day definitions for All Saints and All Souls will now be taken from the particular calendar.

Therefore, it is important that the key in the particular calendar is **exactly** the same as the one in the general calendar so that romcal recognizes it for overriding. Typos (even case mismatch), will cause unexpected results.


### Overriding a liturgical day by its priority

Prioritizing a liturgical day allows it to:

- Override with the same key, a liturgical day that has a higher `rank`
- Prevent it from being overridden by other coinciding days

A liturgical day can be prioritized by adding `prioritized`: `true` to the `data` object in the given liturgical day object. See `src/lib/Celebrations.ts` for more examples.

All liturgical days in `src/lib/Celebrations.ts` (Christmas, Easter) are prioritized as they must override any other liturgical days in the liturgical calendar and cannot be overridden by any other coinciding liturgical day regardless of rank **unless** the coinciding liturgical day is itself prioritized.

For example, `allSaints` in `src/lib/Celebrations.ts` can be overridden by `allSaints` in `src/calendars/england.ts`) because the entry in that particular calendar was set with `prioritized`: `true`.


### Removing liturgical day of the general calendar, in particular calendar output

By default, romcal _does not_ remove any celebrations in its output. Instead, prioritization (see above) is the preferred way to go about overriding celebrations to exhibit different characteristics.

However, in some cases, a particular calendar may need to omit a celebration entirely from its output. For example, the possible reasons could be:

- that the given celebration is entirely irrelevant to the observances of the nation;
- when a celebration of two or more saints are celebrated jointly in the `general` roman calendar, but separately in the particular calendar;
- when a celebration of two or more saints are celebrated separately in the `general` roman calendar, but jointly in the particular calendar.

romcal enables this flexibility via the `drop` key.


#### The `drop` keyword

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
