# Localization

## Localizing celebration names

Celebration names in romcal can be localized to any language that is already supported by [DayJS i18n](https://day.js.org/docs/en/i18n/i18n).

Locales are stored as `.js` files in the `src/locales` directory.

If the given locale contains a region (the second group of letters after a hyphen, e.g. for `fr-CA`, the `CA` represents the region), a base language will be set as a locale fallback (`fr` in our example).

A locale can have one or two fallbacks. `en` is the default locale in romcal and always serves as the last fallback.

Fallbacks are used when a string in the specified locale is not defined in the `src/locales` directory or the given key does not exist in any of previous the locale(s).

For example, a given locale containing region (like `fr-CA`) will gracefully fall back to `fr` if a localization key isn’t in `fr-CA`, or if `fr-CA.js` doesn’t exits in the `src/locales` directory. In the end, it always falls back to `en`, which is the default language in romcal. This should be used also to make the localisation files smaller, i.e. when the locale containing region has a particular string translated the same way as the main locale (e.g. `fr`), we should not localise that particular string in the locale containing region.

The structure of the locale file is typically like so:

```javascript
{
  "advent": {

  },
  "christmastide": {

  },
  "epiphany": {

  },
  "ordinaryTime": {

  },
  "lent": {

  },
  "holyWeek": {

  },
  "eastertide": {

  },
  "celebrations": {

  },
  "general": {

  },
  "national": {

  }
}
```

The first 7 objects define locale keys used by `src/lib/Seasons.js` when generating liturgical dates.

The `celebrations`, `general` and `national` objects will hold localizations for `src/lib/Celebrations.js`, `src/calendars/general.js` and `src/calendars/<country>.js` respectively where the celebrations `key` is used as the identifier for localization purposes.

See the end of these files to see the function that localizes the dates according to their keys.
