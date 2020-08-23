import _ from 'lodash';

import { Dates } from './dates';
import { RomcalLiturgicalDayInput } from '@romcal/models/liturgical-day/liturgical-day.types';
import { RomcalCalendarMetadata } from '@romcal/models/liturgical-day/liturgical-day.types';
import { Ranks } from '@romcal/constants/ranks/ranks.enum';
import { getRankByDayOfWeek, localize, ordinal } from '@romcal/lib/locales';
import {
  RomcalLiturgicalPeriod,
  RomcalLiturgicalSeason,
} from '@romcal/constants/seasons-and-periods/seasons-and-periods.type';
import { LiturgicalPeriods, LiturgicalSeasons } from '@romcal/constants/seasons-and-periods/seasons-and-periods.enum';
import { LiturgicalColors } from '@romcal/constants/liturgical-colors/liturgical-colors.enum';

import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import { RomcalLiturgicalColor } from '@romcal/constants/liturgical-colors/liturgical-colors.type';
import { CelebrationsCycle } from '@romcal/constants/cycles/cycles.enum';

dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear); // dependent on isLeapYear plugin
dayjs.extend(weekOfYear);

/**
 * Given a date in Christmastide, determine the week number of this season
 * @param date The date that occur during christmastide
 */
const getWeekOfChristmastide = (date: Dayjs): number => {
  const y = date.month() === 11 ? date.year() : date.year() - 1;
  const christmas = Dates.christmas(y);
  const firstDayOfWeek = christmas.clone().startOf('week');
  return date.diff(firstDayOfWeek, 'week') + 1;
};

/**
 * Generate the calendar metadata from a date.
 * Week and Day of seasons are computed outside of this method
 * but are included in the returned object
 * @param date the date from which is calculated the calendar metadata
 * @param weekOfSeason Week of season to include in the returned object
 * @param dayOfSeason Day of season to include in the returned object
 */
const getCalendarMetadata = ({
  date,
  weekOfSeason,
  dayOfSeason,
}: {
  date: Dayjs;
  weekOfSeason: number;
  dayOfSeason: number;
}): { calendar: RomcalCalendarMetadata } => {
  const y = date.year();
  const adventInCivilYear = Dates.firstSundayOfAdvent(y);
  const startYear = date.isBefore(adventInCivilYear) ? y - 1 : y;
  const startOfLiturgicalYear = Dates.firstSundayOfAdvent(startYear);
  const endOfLiturgicalYear = Dates.firstSundayOfAdvent(startYear + 1).subtract(1, 'day');

  return {
    calendar: {
      totalWeeksInGregorianYear: date.isoWeeksInYear(),
      totalWeeksInLiturgicalYear: endOfLiturgicalYear.diff(startOfLiturgicalYear, 'week') + 1,
      weekOfGregorianYear: date.week(),
      weekOfLiturgicalYear: date.diff(startOfLiturgicalYear, 'week') + 1,
      weekOfSeason,
      dayOfGregorianYear: date.dayOfYear(),
      dayOfLiturgicalYear: date.diff(startOfLiturgicalYear, 'day') + 1,
      dayOfSeason,
      dayOfWeek: date.day(),
      dayOfWeekCountInMonth: Math.ceil(date.date() / 7),
      startOfLiturgicalYear: startOfLiturgicalYear.toISOString(),
      endOfLiturgicalYear: endOfLiturgicalYear.toISOString(),
      easter: Dates.easter(startYear + 1).toISOString(),
    },
  };
};

/**
 * _.takes an array of [[RomcalDateItem]] items and adds the source key.
 * Also updates the data object of the [[RomcalDateItem]] to include the calendar key.
 * @param items An array of [[RomcalDateItem]] values
 * @returns An array of [[RomcalDateItem]] items.
 */
const setMetadata = async (items: Array<RomcalLiturgicalDayInput>): Promise<Array<RomcalLiturgicalDayInput>> => {
  const metadataPromises = items.map(async ({ date, ...rest }: RomcalLiturgicalDayInput) => {
    return {
      ...rest,
      date,
      source: 'temporal', // IMPORTANT! Refer to RomcalDateItem.source for more information
    } as RomcalLiturgicalDayInput;
  });
  return await Promise.all(metadataPromises);
};

/**
 * Calculates the days in the period of Epiphany.
 * @param year The year to use for the calculation
 * @param epiphanyOnSunday If false, Epiphany will be fixed to Jan 6 (defaults to true)
 */
const epiphany = async (year: number, epiphanyOnSunday = true): Promise<Array<RomcalLiturgicalDayInput>> => {
  const before: Array<Dayjs> = Dates.datesBeforeEpiphany(year, epiphanyOnSunday);
  const epiphany: Dayjs = Dates.epiphany(year, epiphanyOnSunday);
  const after: Array<Dayjs> = Dates.datesAfterEpiphany(year, epiphanyOnSunday);

  const datesBeforePromise = await Promise.all(
    before.map(
      async (date: Dayjs, i: number) =>
        ({
          date,
          key: `${date.locale('en').format('dddd').toCamelCase()}BeforeEpiphany`,
          rank: Ranks.WEEKDAY,
          name: await localize({
            key: 'epiphany.before',
            day: date.format('dddd'),
          }),
          seasons: [LiturgicalSeasons.CHRISTMASTIDE],
          seasonNames: [await localize({ key: 'christmastide.season' })],
          periods: [LiturgicalPeriods.DAYS_BEFORE_EPIPHANY, LiturgicalPeriods.CHRISTMAS_TO_PRESENTATION_OF_THE_LORD],
          liturgicalColors: [LiturgicalColors.WHITE],
          ...getCalendarMetadata({
            date,
            weekOfSeason: getWeekOfChristmastide(date),
            dayOfSeason: 9 + i,
          }),
          cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
        } as RomcalLiturgicalDayInput),
    ),
  );

  const dateOfEpiphanyPromise = await Promise.all([
    {
      date: epiphany,
      key: 'dayOfEpiphany',
      rank: Ranks.SOLEMNITY,
      name: await localize({
        key: 'celebrations.epiphany',
      }),
      seasons: [LiturgicalSeasons.CHRISTMASTIDE],
      seasonNames: [await localize({ key: 'christmastide.season' })],
      periods: [LiturgicalPeriods.CHRISTMAS_TO_PRESENTATION_OF_THE_LORD],
      liturgicalColors: [LiturgicalColors.WHITE],
      ...getCalendarMetadata({
        date: epiphany,
        weekOfSeason: getWeekOfChristmastide(epiphany),
        dayOfSeason: epiphany.date() + 7,
      }),
    } as RomcalLiturgicalDayInput,
  ]);

  const datesAfterPromise = await Promise.all(
    after.map(
      async (date: Dayjs) =>
        ({
          date,
          key: `${date.locale('en').format('dddd').toCamelCase()}AfterEpiphany`,
          rank: Ranks.WEEKDAY,
          name: await localize({
            key: 'epiphany.after',
            day: date.format('dddd'),
          }),
          seasons: [LiturgicalSeasons.CHRISTMASTIDE],
          seasonNames: [await localize({ key: 'christmastide.season' })],
          periods: [LiturgicalPeriods.DAYS_AFTER_EPIPHANY, LiturgicalPeriods.CHRISTMAS_TO_PRESENTATION_OF_THE_LORD],
          liturgicalColors: [LiturgicalColors.WHITE],
          ...getCalendarMetadata({
            date,
            weekOfSeason: getWeekOfChristmastide(date),
            dayOfSeason: date.date() + 7,
          }),
          cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
        } as RomcalLiturgicalDayInput),
    ),
  );

  return [...datesBeforePromise, ...dateOfEpiphanyPromise, ...datesAfterPromise];
};

/**
 * Returns the days constituting holy week
 * @param year The year to use for the calculation
 */
const holyWeek = async (year: number): Promise<Array<RomcalLiturgicalDayInput>> => {
  const dates: Dayjs[] = Dates.holyWeek(year);
  const datesPromise = dates.map(async (date: Dayjs, i: number) => {
    return {
      date,
      key: `${date.locale('en').format('dddd').toCamelCase()}OfHolyWeek`,
      rank: Ranks.HOLY_WEEK,
      name: await localize({
        key: 'holyWeek.weekday',
        day: date.format('dddd'),
      }),
      seasons: ((): RomcalLiturgicalSeason[] => {
        const arr: RomcalLiturgicalSeason[] = [];
        if (date.day() <= 4) arr.push(LiturgicalSeasons.LENT); // Until holy thursday
        if (date.day() >= 4) arr.push(LiturgicalSeasons.PASCHAL_TRIDUUM); // From holy thursday
        return arr;
      })(),
      seasonNames: await (async (): Promise<string[]> => {
        const arr: string[] = [];
        if (date.day() <= 4) arr.push(await localize({ key: 'lent.season' })); // Until holy thursday
        if (date.day() >= 4) arr.push(await localize({ key: 'paschal_triduum.season' })); // From holy thursday
        return arr;
      })(),
      periods: [
        LiturgicalPeriods.HOLY_WEEK,
        ...((): RomcalLiturgicalPeriod[] =>
          date.day() <= 4 ? [LiturgicalPeriods.PRESENTATION_OF_THE_LORD_TO_HOLY_THURSDAY] : [])(), // Until holy thursday
      ],
      liturgicalColors: [LiturgicalColors.PURPLE],
      ...getCalendarMetadata({
        date,
        weekOfSeason: 6,
        dayOfSeason: 40 + i,
      }),
      cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
    } as RomcalLiturgicalDayInput;
  });
  return await Promise.all(datesPromise);
};

export class Seasons {
  /**
   * Calculates the days in the season of Advent.
   *
   *  **LITURGICAL COLORS - ADVENT**
   *
   *  The First Sunday of Advent always begins Week 1 of the Psalter,
   *  regardless of which week was previously observed (because the First
   *  Sunday of Advent is the first day of the liturgical year, the 4-Week
   *  cycle of the Psalter is “reset” to Week 1 on it).
   *  For example, as it works out on the liturgical calendar, the last
   *  week of Ordinary Time (i.e., the Solemnity of Christ the King, which
   *  is the last Sunday of Ordinary Time, and the following Monday through
   *  Saturday afternoon) uses Week 2 of the Psalter. Nevertheless, when
   *  the First Sunday of Advent arrives, one does not start using Week 3,
   *  but rather Week 1 of the Psalter.
   *
   *   *The proper color of the Advent is purple.*
   *
   * @param year The year to use for the calculation
   */
  static advent = async (year: number): Promise<Array<RomcalLiturgicalDayInput>> => {
    const daysOfAdventPromise = Dates.datesOfAdvent(year).map(async (date: Dayjs, i: number) => {
      return {
        date,
        key:
          date.day() === 0
            ? `${ordinal(Math.floor(i / 7) + 1, true).toCamelCase()}SundayOfAdvent`
            : `${date.locale('en').format('dddd').toCamelCase()}OfThe${ordinal(
                Math.floor(i / 7) + 1,
              ).toPascalCase()}WeekOfAdvent`,
        rank: getRankByDayOfWeek(date.day()),
        name: await localize({
          key: date.day() === 0 ? 'advent.sunday' : 'advent.weekday',
          day: date.format('dddd'),
          week: Math.floor(i / 7) + 1,
        }),
        seasons: [LiturgicalSeasons.ADVENT],
        seasonNames: [await localize({ key: 'advent.season' })],
        liturgicalColors: ((): RomcalLiturgicalColor[] => {
          const arr = [LiturgicalColors.PURPLE];
          // The proper color of the Third Sunday of Advent is rose. Purple may also be used on these Sundays.
          if (Math.floor(i / 7) === 2 && date.day() === 0) arr.unshift(LiturgicalColors.ROSE);
          return arr;
        })(),
        ...getCalendarMetadata({
          date,
          weekOfSeason: Math.floor(i / 7) + 1,
          dayOfSeason: i + 1,
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    let items: Array<RomcalLiturgicalDayInput> = await Promise.all(daysOfAdventPromise);

    // Sort dates according to their date.objects in ascending order
    items = _.sortBy(items, (item) => item.date.valueOf());

    return await setMetadata(items);
  };

  /**
   * Calculates the days in the season of Christmastide.
   *
   * **PSALTER WEEKS & LITURGICAL COLORS - CHRISTMAS SEASON**
   *
   * If Christmas is on a weekday (Monday - Saturday), then the first
   * week of Christmastide will follow the Psalter week of the 4th week
   * of Advent (which is always Psalter Week 4)
   * If Christmas is on a Sunday, the Psalter week will be Week 1
   *
   * *The proper color of Christmas is white.
   *
   * @param year The year to use for the calculation
   * @param epiphanyOnSunday If false, Epiphany will be fixed to Jan 6 (defaults to true)
   */
  static christmastide = async (year: number, epiphanyOnSunday = true): Promise<Array<RomcalLiturgicalDayInput>> => {
    const datesOfChristmastide: Dayjs[] = Dates.datesOfChristmas(year, epiphanyOnSunday);
    const datesInTheOctaveOfChristmas: Dayjs[] = Dates.octaveOfChristmas(year);
    const daysInThePeriodOfEpiphany: Array<RomcalLiturgicalDayInput> = await epiphany(year + 1, epiphanyOnSunday);
    let count = 0;

    const datesOfChristmastidePromise = datesOfChristmastide.map(async (date: Dayjs, i: number) => {
      const dayOfWeek = date.day();
      count = dayOfWeek === 0 ? count + 1 : count;
      return {
        date,
        key:
          dayOfWeek === 0
            ? `${ordinal(count, true).toCamelCase()}SundayOfChristmas`
            : `${date.locale('en').format('dddd').toCamelCase()}OfChristmastide`,
        rank: getRankByDayOfWeek(dayOfWeek),
        name: await localize({
          key: dayOfWeek === 0 ? 'christmastide.sunday' : 'christmastide.date',
          day: date.format('dddd'),
          count,
        }),
        liturgicalColors: [LiturgicalColors.WHITE],
        seasons: [LiturgicalSeasons.CHRISTMASTIDE],
        seasonNames: [await localize({ key: 'christmastide.season' })],
        periods: [LiturgicalPeriods.CHRISTMAS_TO_PRESENTATION_OF_THE_LORD],
        ...getCalendarMetadata({
          date,
          weekOfSeason: getWeekOfChristmastide(date),
          dayOfSeason: i + 1,
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    const daysOfChristmastide: Array<RomcalLiturgicalDayInput> = await Promise.all(datesOfChristmastidePromise);

    const datesInTheOctaveOfChristmasPromise = datesInTheOctaveOfChristmas.map(async (date: Dayjs, i: number) => {
      return {
        date,
        key: `${ordinal(i + 1, true).toCamelCase()}DayInTheOctaveOfChristmas`,
        rank: getRankByDayOfWeek(date.day()),
        name: await localize({
          key: 'christmastide.octave',
          count: i + 1,
        }),
        liturgicalColors: [LiturgicalColors.WHITE],
        seasons: [LiturgicalSeasons.CHRISTMASTIDE],
        seasonNames: [await localize({ key: 'christmastide.season' })],
        periods: [LiturgicalPeriods.CHRISTMAS_OCTAVE, LiturgicalPeriods.CHRISTMAS_TO_PRESENTATION_OF_THE_LORD],
        ...getCalendarMetadata({
          date,
          weekOfSeason: getWeekOfChristmastide(date),
          dayOfSeason: i + 1,
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    const daysInTheOctaveOfChristmas: Array<RomcalLiturgicalDayInput> = await Promise.all(
      datesInTheOctaveOfChristmasPromise,
    );

    //==============================================================================
    // Override in order: solemnities, feasts, epiphany and octave of christmas
    // to days of christmas
    //==============================================================================

    let combinedDaysOfChristmas: Array<RomcalLiturgicalDayInput>;
    combinedDaysOfChristmas = _.uniqBy(
      _.union(daysInThePeriodOfEpiphany, daysInTheOctaveOfChristmas, daysOfChristmastide),
      (item) => item.date.valueOf(),
    );

    // Sort dates according to their unix time
    combinedDaysOfChristmas = _.sortBy(combinedDaysOfChristmas, (item) => item.date.valueOf());

    return await setMetadata(combinedDaysOfChristmas);
  };

  /**
   * Calculates the first half of ordinary time in a given liturgical year.
   *
   * **LITURGICAL COLORS - EARLY ORDINARY TIME**
   *
   * The first week of Ordinary Time begins with the Monday following
   * the Feast of the Baptism of the Lord (which is the last Sunday of
   * the Christmas Season). The Sunday that follows the first week of
   * Ordinary Time is the Second Sunday of Ordinary Time, so, technically
   * speaking, there is no Sunday that is called the First Sunday of
   * Ordinary Time. This makes sense if you consider the fact that
   * Ordinary Time begins on a Monday, and by the time Sunday rolls
   * around the first week of Ordinary Time has already been completed.
   * In light of all this, although the Feast of the Baptism of the Lord
   * is the last Sunday of the Christmas Season, simply for the purposes
   * of counting Sundays it is counted as the first Sunday of Ordinary Time.
   *
   * *The proper color of ordinary time is green.*
   *
   * @param year The year to use
   * @param epiphanyOnSunday By default, Epiphany is celebrated on Sunday. If false, will cause Epiphany to land on January the 6th.
   * @returns
   */
  static earlyOrdinaryTime = async (year: number, epiphanyOnSunday = true): Promise<RomcalLiturgicalDayInput[]> => {
    const presentationOfTheLord = Dates.presentationOfTheLord(year);
    const daysOfEarlyOrdinaryTimePromise = Dates.datesOfEarlyOrdinaryTime(year, epiphanyOnSunday).map(
      async (date: Dayjs, i: number) => {
        const week = date.day() === 0 ? Math.floor(i / 7) + 2 : Math.floor(i / 7) + 1;
        return {
          date,
          key:
            date.day() === 0
              ? `${ordinal(Math.floor(i / 7) + 2, true).toCamelCase()}SundayOfOrdinaryTime`
              : `${date.locale('en').format('dddd').toCamelCase()}OfThe${ordinal(
                  Math.floor(i / 7) + 1,
                  true,
                ).toPascalCase()}WeekOfOrdinaryTime`,
          rank: date.day() === 0 ? Ranks.SUNDAY : Ranks.WEEKDAY,
          name: await localize({
            key: date.day() === 0 ? 'ordinary_time.sunday' : 'ordinary_time.weekday',
            day: date.format('dddd'),
            week,
          }),
          seasons: [LiturgicalSeasons.ORDINARY_TIME],
          seasonNames: [await localize({ key: 'ordinary_time.season' })],
          liturgicalColors: [LiturgicalColors.GREEN],
          periods: [
            LiturgicalPeriods.EARLY_ORDINARY_TIME,
            ...((): RomcalLiturgicalPeriod[] =>
              date.isSameOrBefore(presentationOfTheLord)
                ? [LiturgicalPeriods.CHRISTMAS_TO_PRESENTATION_OF_THE_LORD]
                : [])(),
            ...((): RomcalLiturgicalPeriod[] =>
              date.isSameOrAfter(presentationOfTheLord)
                ? [LiturgicalPeriods.PRESENTATION_OF_THE_LORD_TO_HOLY_THURSDAY]
                : [])(),
          ],
          ...getCalendarMetadata({
            date,
            weekOfSeason: week,
            dayOfSeason: (week - 1) * 7 + date.day(),
          }),
          cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
        } as RomcalLiturgicalDayInput;
      },
    );
    let days: RomcalLiturgicalDayInput[] = await Promise.all(daysOfEarlyOrdinaryTimePromise);

    // Sort dates according to the value of the DayJS date object
    days = _.sortBy(days, (v) => v.date.valueOf());

    return await setMetadata(days);
  };

  /**
   * Calculates the latter half of ordinary time in a given liturgical year.
   *
   * **LITURGICAL- LATER ORDINARY TIME**
   *
   * The second phase of Ordinary Time begins on the Monday that immediately
   * follows Pentecost Sunday (i.e., the last Sunday of the Season of Easter).
   * Note that, because the date of Easter changes from year to year, the
   * specific range of dates for the two phases in Ordinary Time likewise
   * change from year to year. In any event, the Monday of Ordinary Time
   * which immediately follows Pentecost Sunday does not “reset” to Week
   * 1 of the Psalter. Rather, it will simply be the week of the Psalter
   * corresponding to the Sunday to which the Monday belongs.
   *
   * *The proper color of Ordinary Time is green.*
   *
   * @param year
   */
  static laterOrdinaryTime = async (year: number): Promise<RomcalLiturgicalDayInput[]> => {
    const daysOfLaterOrdinaryTimePromise = Dates.datesOfLaterOrdinaryTime(year)
      .reverse()
      .map(async (date: Dayjs, i: number) => {
        // Calculate the week of ordinary time
        // from the last sunday of the year (34th)
        const week = 34 - Math.floor(i / 7);

        return {
          date,
          key:
            date.day() === 0
              ? `${ordinal(week, true).toCamelCase()}SundayOfOrdinaryTime`
              : `${date.locale('en').format('dddd').toCamelCase()}OfThe${ordinal(
                  week,
                  true,
                ).toPascalCase()}WeekOfOrdinaryTime`,
          rank: date.day() === 0 ? Ranks.SUNDAY : Ranks.WEEKDAY,
          name: await localize({
            key: date.day() === 0 ? 'ordinary_time.sunday' : 'ordinary_time.weekday',
            day: date.format('dddd'),
            week: week,
          }),
          seasons: [LiturgicalSeasons.ORDINARY_TIME],
          seasonNames: [await localize({ key: 'ordinary_time.season' })],
          liturgicalColors: [LiturgicalColors.GREEN],
          periods: [LiturgicalPeriods.LATER_ORDINARY_TIME],
          ...getCalendarMetadata({
            date,
            weekOfSeason: week,
            dayOfSeason: (week - 2) * 7 - 5 + date.day(),
          }),
          cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
        } as RomcalLiturgicalDayInput;
      });
    let days: RomcalLiturgicalDayInput[] = await Promise.all(daysOfLaterOrdinaryTimePromise);

    // Sort dates according to moment
    days = _.sortBy(days, (v) => v.date.valueOf());

    return await setMetadata(days);
  };

  /**
   * Calculates the ordinary time in a given liturgical year.
   * @param year
   * @param epiphanyOnSunday
   */
  static ordinaryTime = async (year: number, epiphanyOnSunday: boolean): Promise<RomcalLiturgicalDayInput[]> =>
    Promise.all([
      Seasons.earlyOrdinaryTime(year, epiphanyOnSunday),
      Seasons.laterOrdinaryTime(year),
    ]).then(([early, later]) => early.concat(later));

  /**
   * Calculates the days in the season of Lent
   *
   * **LITURGICAL COLORS - LENT & HOLY WEEK**
   *
   * Lent begins on Ash Wednesday and therefore in the middle of a week
   * rather than on a Sunday. Regardless of which week of the Psalter is
   * being observed on the Sunday through Tuesday immediately preceding
   * Ash Wednesday, Ash Wednesday (and the Thursday through Saturday
   * afternoon following it) are designated as Week 4 of the Psalter.
   *
   * *The proper color of the Lent is purple.*
   *
   * @param year The year to use for calculation
   */
  static lent = async (year: number): Promise<RomcalLiturgicalDayInput[]> => {
    const datesOfLent: Array<Dayjs> = Dates.datesOfLent(year);
    const sundaysOfLent: Array<Dayjs> = Dates.sundaysOfLent(year);

    const daysOfLentPromise: Promise<RomcalLiturgicalDayInput>[] = datesOfLent.map(async (date: Dayjs, i: number) => {
      const week = Math.floor((i - 4) / 7) + 1;

      return {
        date,
        key:
          i < 4
            ? `${date.locale('en').format('dddd').toCamelCase()}AfterAshWednesday`
            : `${date.locale('en').format('dddd').toCamelCase()}OfThe${ordinal(week, true).toPascalCase()}WeekOfLent`,
        rank: Ranks.WEEKDAY,
        name: await localize({
          key: i === 0 ? 'celebrations.ash_wednesday' : i < 4 ? 'lent.day_after_ash_wed' : 'lent.weekday',
          day: date.format('dddd'),
          week,
        }),
        seasons: [LiturgicalSeasons.LENT],
        seasonNames: [await localize({ key: 'lent.season' })],
        periods: [LiturgicalPeriods.PRESENTATION_OF_THE_LORD_TO_HOLY_THURSDAY],
        liturgicalColors: [LiturgicalColors.PURPLE],
        ...getCalendarMetadata({
          date,
          weekOfSeason: week,
          dayOfSeason: i + 1,
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    const weekdays = await Promise.all(daysOfLentPromise);

    const sundaysOfLentPromise = sundaysOfLent.map(async (date: Dayjs, i: number) => {
      return {
        date,
        key: `${ordinal(i + 1, true).toCamelCase()}SundayOfLent`,
        rank: Ranks.SUNDAY,
        name: await localize({
          key: 'lent.sunday',
          week: i + 1,
        }),
        seasons: [LiturgicalSeasons.LENT],
        seasonNames: [await localize({ key: 'lent.season' })],
        periods: [LiturgicalPeriods.PRESENTATION_OF_THE_LORD_TO_HOLY_THURSDAY],
        liturgicalColors: ((): RomcalLiturgicalColor[] => {
          const arr = [LiturgicalColors.PURPLE];
          // The proper color of the the Fourth Sunday of Lent is rose. Purple may also be used on these Sundays.
          if (i === 3) arr.unshift(LiturgicalColors.ROSE);
          return arr;
        })(),
        ...getCalendarMetadata({
          date,
          weekOfSeason: i + 1,
          dayOfSeason: i * 7 + 5,
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    const sundays = await Promise.all(sundaysOfLentPromise);

    const daysOfHolyWeek: RomcalLiturgicalDayInput[] = await holyWeek(year);

    let combinedDaysOfLent: RomcalLiturgicalDayInput[];

    // Override in order: Solemnities, Holy Week and Sundays of Lent to days of Lent
    combinedDaysOfLent = _.uniqBy(_.union(daysOfHolyWeek, sundays, weekdays), (v) => v.date.valueOf());

    // Sort dates according to DayJS
    combinedDaysOfLent = _.sortBy(combinedDaysOfLent, (v) => v.date.valueOf());

    combinedDaysOfLent = await setMetadata(combinedDaysOfLent);

    return combinedDaysOfLent;
  };

  /**
   * _.takes the last 3 days of holy week which form the 3 days of Paschal Triduum.
   *
   * @param year The year to use for the calculation
   */
  static paschalTriduum = async (year: number): Promise<RomcalLiturgicalDayInput[]> => (await holyWeek(year)).slice(-3);

  /**
   * Calculates the season of Easter.
   *
   * **LITURGICAL COLOR - EASTER**
   *
   * The first eight days of the Easter Season make up the octave of Easter
   * and are celebrated as Solemnities of the Lord.
   * During this time, Easter Octave readings are used in favour of the
   * standard psalter readings.
   * The psalter is resumed at week 2 on the Monday following Divine
   * Mercy Sunday
   *
   * *The proper color of Easter is white*
   *
   * @param year The year to use for the calculation
   */
  static eastertide = async (year: number): Promise<RomcalLiturgicalDayInput[]> => {
    const weekdaysOfEaster = Dates.datesOfEaster(year);
    const sundaysOfEaster = Dates.sundaysOfEaster(year);

    const weekdaysOfEasterPromise = weekdaysOfEaster.map(async (date: Dayjs, i: number) => {
      const week = Math.floor(i / 7) + 1;
      return {
        date,
        key:
          i < 7
            ? `easter${date.locale('en').format('dddd').toPascalCase()}`
            : `${date.locale('en').format('dddd').toCamelCase()}OfThe${ordinal(week, true).toPascalCase()}WeekOfEaster`,
        rank: i < 7 ? Ranks.SOLEMNITY : Ranks.WEEKDAY,
        name: await localize({
          key: i < 7 ? 'eastertide.octave' : 'eastertide.weekday',
          day: date.locale('en').format('dddd'),
          week: week,
        }),
        seasons: [LiturgicalSeasons.EASTERTIDE],
        seasonNames: [await localize({ key: 'eastertide.season' })],
        periods: i < 7 ? [LiturgicalPeriods.EASTER_OCTAVE] : [],
        liturgicalColors: [LiturgicalColors.WHITE],
        ...getCalendarMetadata({
          date,
          weekOfSeason: week,
          dayOfSeason: (week - 1) * 7 + 1 + date.day(),
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    const days: RomcalLiturgicalDayInput[] = await Promise.all(weekdaysOfEasterPromise);

    const sundaysOfEasterPromise = sundaysOfEaster.map(async (date: Dayjs, i: number) => {
      return {
        date,
        key: `${ordinal(i + 1, true).toCamelCase()}SundayOfEaster`,
        rank: Ranks.SUNDAY,
        name: await localize({
          key: 'eastertide.sunday',
          week: i + 1,
        }),
        seasons: [LiturgicalSeasons.EASTERTIDE],
        seasonNames: [await localize({ key: 'eastertide.season' })],
        periods: i < 2 ? [LiturgicalPeriods.EASTER_OCTAVE] : [],
        liturgicalColors: [LiturgicalColors.WHITE],
        ...getCalendarMetadata({
          date,
          weekOfSeason: i + 1,
          dayOfSeason: i * 7 + 1 + date.day(),
        }),
        cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
      } as RomcalLiturgicalDayInput;
    });
    const sundays: RomcalLiturgicalDayInput[] = await Promise.all(sundaysOfEasterPromise);

    let combinedDaysOfEaster: RomcalLiturgicalDayInput[];

    // Insert Solemnities and Sundays of Easter to days of Easter
    combinedDaysOfEaster = _.uniqBy(_.union(sundays, days), (v) => v.date.valueOf());

    // Sort dates according to DayJS
    combinedDaysOfEaster = _.sortBy(combinedDaysOfEaster, (v) => v.date.valueOf());

    combinedDaysOfEaster = await setMetadata(combinedDaysOfEaster);

    return combinedDaysOfEaster;
  };

  /**
   * Takes the days between Easter Sunday and Divine mercy sunday (inclusive) to form the easter octave
   *
   * @param year The year to use for the calculation
   */
  static easterOctave = async (year: number): Promise<RomcalLiturgicalDayInput[]> =>
    (await Seasons.eastertide(year)).slice(0, 8);
}
