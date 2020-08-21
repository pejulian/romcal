# Localization

## Localizing liturgical day names

Liturgical day names in romcal can be localized to any language that is already supported by [DayJS i18n](https://day.js.org/docs/en/i18n/i18n).

Locales are stored as `.ts` files in the `src/locales` directory.

If the given locale contains a region (the second group of letters after a hyphen, e.g. for `fr-ca`, the `ca` represents the region), a base language will be set as a locale fallback (`fr` in our example).

A locale can have one or two fallbacks. `en` is the default locale in romcal and always serves as the last fallback.

The fallbacks are used when a string in the specified locale is not defined in the `src/locales` directory or the given key does not exist in any of previous locale(s).

For example, a given locale containing region (like `fr-ca`) will gracefully fall back to `fr` if a localization key isn’t in `fr-ca`, or if `fr-ca.ts` doesn’t exits in the `src/locales` directory.
In the end, it always falls back to `en`, which is the default language in romcal.
This should also be used to make the localization files smaller, i.e. when the locale containing region has a particular string translated the same way as the main locale (e.g. `fr`), we should not localize that particular string in the locale containing region.

The structure of the locale file is typically like so:

```json5
{
  advent: {},
  christmastide: {},
  epiphany: {},
  ordinary_time: {},
  lent: {},
  holy_week: {},
  eastertide: {},
  liturgical_colors: {},
  ranks: {},
  celebrations: {},
  sanctoral: {},
}
```

The first 7 objects define locale keys used by `src/lib/Seasons.ts` when generating liturgical dates.

The `celebrations` and `sanctoral` objects will hold localization for `src/lib/Celebrations.ts`, `src/calendars/general.ts` and `src/calendars/<country>.ts` respectively where the celebration `key` is used as an identifier for localization purposes.

See the end of these files to see the function that localizes the dates according to their keys.
