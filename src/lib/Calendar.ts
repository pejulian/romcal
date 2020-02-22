/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from "lodash";
import dayjs from "dayjs";
import * as CountryCalendars from "../calendars";
import Config, { IRomcalConfig } from "../models/romcal-config";
import * as Dates from "./Dates";
import * as Locales from "./Locales";
import * as Seasons from "./Seasons";
import * as Celebrations from "./Celebrations";
import { TCountryTypes, isNil, isInteger, isObject, TRomcalQuery, Dictionary } from "../utils/type-guards";
import { hasKey } from "../utils/object";
import { DateItem, IRomcalDateItem, IRomcalDateItemData } from "../models/romcal-date-item";
import { Types } from "../constants";
import { find, removeWhere, groupBy } from "../utils/array";
import { dayJsToMomentJs } from "../utils/dates";
import { extractedTypeKeys } from "../constants/Types";

/**
 * Filters an array of dates generated from the calendarFor function based on a given query.
 *
 * @param dates An array of dates generated from the `calendarFor` function
 * @param query A query object containing criteria to filter the dates by
 */
function queryFor<U extends undefined | null>(dates: Array<DateItem>, query: U): DateItem[];
function queryFor<U extends TRomcalQuery>(
    dates: DateItem[],
    query: U,
): "group" extends keyof U // is a group key defined in the query?
    ? U["group"] extends "daysByMonth" | "weeksByMonth" // does the group key have one of these values?
        ? Dictionary<DateItem[]>[]
        : Dictionary<DateItem[]>
    : "month" extends keyof U // is a month key defined in the query?
    ? DateItem[]
    : "day" extends keyof U // else is a day key defined in the query?
    ? DateItem[]
    : "title" extends keyof U // else, is a title key defined in the query?
    ? DateItem[]
    : DateItem[]; // If none of the above, then return the original array;
function queryFor(
    dates: DateItem[],
    query: TRomcalQuery,
): DateItem[] | Dictionary<DateItem[]> | Dictionary<DateItem[]>[] {
    if (isNil(query)) {
        return dates;
    }
    if (hasKey(query, "group")) {
        switch (query.group) {
            case "months":
                return _.groupBy(dates, d => d.moment.month());
            case "daysByMonth":
                // eslint-disable-next-line you-dont-need-lodash-underscore/map
                return _.map(
                    _.groupBy(dates, d => d.moment.month()),
                    monthGroup => _.groupBy(monthGroup, d => d.moment.day()),
                );
            case "weeksByMonth":
                // eslint-disable-next-line you-dont-need-lodash-underscore/map
                return _.map(
                    _.groupBy(dates, d => d.moment.month()),
                    v => _.groupBy(v, d => d.data.calendar?.week),
                );
            case "cycles":
                return _.groupBy(dates, d => d.data.meta.cycle?.value);
            case "types":
                return _.groupBy(dates, d => d.type);
            case "liturgicalSeasons":
                return _.groupBy(dates, d => d.data.season.key);
            case "liturgicalColors":
                return _.groupBy(dates, d => d.data.meta.liturgicalColor?.key);
            case "psalterWeeks":
                return _.groupBy(dates, d => d.data.meta.psalterWeek?.key);
            case "days":
            default:
                return _.groupBy(dates, d => d.moment.day());
        }
    } else if (!isNil(query.month)) {
        // Months are zero indexed, so January is month 0.
        return dates.filter(dateItem => dateItem.moment.month() === query.month);
    } else if (!isNil(query.day)) {
        // Days are zero index, so Sunday is 0.
        return dates.filter(dateItem => dateItem.moment.day() === query.day);
    } else if (!isNil(query.title)) {
        const { title } = query;
        return dates.filter(date => date.data.meta.titles?.includes(title));
    } else {
        return dates;
    }
}

// const d1: DateItem[] = [];
// const t0 = queryFor(d1);
// const t1 = queryFor(d1, { day: 1 });
// const t2 = queryFor(d1, { month: 1 });
// const t3 = queryFor(d1, { title: "" });
// const t4 = queryFor(d1, { group: "daysByMonth" });
// const t5 = queryFor(d1, { group: "weeksByMonth" });
// const t6 = queryFor(d1, { group: "months" });
// const t7 = queryFor(d1, { group: "cycles" });
// const t8 = queryFor(d1, { group: "types" });
// const t9 = queryFor(d1, { group: "liturgicalSeasons" });
// const t10 = queryFor(d1, { group: "liturgicalColors" });
// const t11 = queryFor(d1, { group: "psalterWeeks" });
// const t12 = queryFor(d1, { group: "days" });

function calendarFor<T extends undefined | null>(options?: T): DateItem[];
function calendarFor<T extends IRomcalConfig | number>(
    options?: T,
): T extends number
    ? DateItem[]
    : "query" extends keyof T
    ? DateItem[] | Dictionary<DateItem[]> | Dictionary<DateItem[]>[]
    : DateItem[];
/**
 * Returns an array of liturgical dates based on the supplied options.
 *
 * The array may return dates according to the given calendar year or liturgical
 * year depending on the options supplied.
 *
 * If a query object is passed, a filtered array of liturgical calendar dates is returned
 * according to the given calendar options and filtering options passed in by the user.
 *
 * If the config object has a query, it will be used to filter the
 * date results returned by an internal call to the `queryFor` method.
 *
 * @param options A configuration object or a year (integer)
 */
function calendarFor(options?: IRomcalConfig | number): DateItem[] | Dictionary<DateItem[]> | Dictionary<DateItem[]>[] {
    let userConfig: IRomcalConfig = {};

    // If options is passed as an integer,
    // assume we want the calendar for the current year
    // with default options
    if (!isNil(options)) {
        if (isInteger(options)) {
            userConfig = { year: options };
        } else {
            userConfig = options;
        }
    }

    // Sanitize incoming config into a complete configuration set
    const config = new Config(userConfig);

    // Set the locale information
    Locales.setLocale(config.locale);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const calendar = new Calendar(config);
    // Get a new collection of dates
    const dates = calendar.fetch().values();

    // Determine if there's a query to execute. If none,
    // just return the array if DateItems to the caller
    if (isNil(config.query) || !isObject(config.query) || isNil(options)) {
        return dates;
    } else {
        // Run queries and return the results
        return queryFor(dates, config.query);
    }
}

// const d2: DateItem[] = [];
// const tt1 = calendarFor();
// const tt2 = calendarFor(2020);
// const tt3 = calendarFor({ year: 2020 });
// const tt3 = calendarFor({ query: { day: 1 } });

/**
 * Calendar Class:
 * Combine together all the different collections of date item objects,
 * according to the liturgical calendar for the specific year.
 */
class Calendar {
    private dateItems: Array<DateItem> = [];
    private config: Config;
    private startDate: dayjs.Dayjs;
    private endDate: dayjs.Dayjs;

    /**
     * Create a new Calendar
     */
    constructor(config: Config) {
        this.config = config;
        const { type, year } = config;
        if (type === "liturgical") {
            this.startDate = Dates.firstSundayOfAdvent(year - 1);
            this.endDate = Dates.firstSundayOfAdvent(year).subtract(1, "day");
        } else {
            this.startDate = dayjs.utc(`${year}-1-1`);
            this.endDate = dayjs.utc(`${year}-12-31`);
        }
    }

    /**
     * Fetch calendars and date items that occur during a specific year (civil or liturgical).
     */
    fetch(): Calendar {
        const {
            ascensionOnSunday,
            christmastideEnds,
            christmastideIncludesTheSeasonOfEpiphany,
            corpusChristiOnThursday,
            country,
            epiphanyOnJan6,
            type,
            year: theYear,
        } = this.config;

        // Set the year range depending on the calendar type
        const years = type === "liturgical" ? [theYear - 1, theYear] : [theYear];

        // Define all calendars
        let seasonDates: Array<IRomcalDateItem> = [];
        let celebrationsDates: Array<IRomcalDateItem> = [];
        let generalDates: Array<IRomcalDateItem> = [];
        let nationalDates: Array<IRomcalDateItem> = [];

        // Get a collection of date items from all liturgical seasons of the given year
        years.forEach(year => {
            seasonDates = [
                ...seasonDates,
                ...Seasons.christmastide(
                    year - 1,
                    christmastideEnds,
                    epiphanyOnJan6,
                    christmastideIncludesTheSeasonOfEpiphany,
                ),
                ...Seasons.earlyOrdinaryTime(year, christmastideEnds, epiphanyOnJan6),
                ...Seasons.lent(year),
                ...Seasons.eastertide(year),
                ...Seasons.laterOrdinaryTime(year),
                ...Seasons.advent(year),
                ...Seasons.christmastide(
                    year,
                    christmastideEnds,
                    epiphanyOnJan6,
                    christmastideIncludesTheSeasonOfEpiphany,
                ),
            ];

            // Get the celebration dates based on the given year and options
            celebrationsDates = [
                ...celebrationsDates,
                ...Celebrations.dates(year, epiphanyOnJan6, corpusChristiOnThursday, ascensionOnSunday),
            ];

            // Get the general calendar based on the given year
            generalDates = [...generalDates, ...Calendar._fetchCalendar("general", year)];

            // Get the relevant national calendar object based on the given year and country
            nationalDates = [...nationalDates, ...Calendar._fetchCalendar(country, year)];
        });

        let calendarSources: Array<Array<IRomcalDateItem>> = [
            seasonDates,
            celebrationsDates,
            generalDates,
            nationalDates,
        ];

        // Remove all date items not in the given date range
        calendarSources = Calendar._filterItemRange(this.startDate, this.endDate, ...calendarSources);

        // Remove all date items marked as 'drop' from any other date items
        calendarSources = Calendar._dropItems(calendarSources);

        // Push new item object as a new DateItem
        this._push(calendarSources);

        // Finally, sort the DateItems by date and rank and keep only the relevant
        this._sortAndKeepRelevant();

        return this;
    }

    /**
     * Get all DateItems for a specific calendar
     */
    values(): DateItem[] {
        return this.dateItems;
    }

    /**
     * Push new DateItem objects in the Calendar object
     * @param calendars An array of calendar sources to process.
     */
    _push(calendars: Array<Array<IRomcalDateItem>>): void {
        // Loop through each date source group
        calendars.forEach((calendar: Array<IRomcalDateItem>, index: number) =>
            // Loop through the dates in each source group
            calendar.forEach((item: IRomcalDateItem) => {
                // Remove non-prioritized celebrations in the date items array which share the same key as the current item
                this._keepPrioritizedOnly(item);

                // Find the season date that has the same date as the incoming item and make it the base item.
                const baseItem = find(this.dateItems, { date: item.moment.toISOString(), _stack: 0 });

                const { key, name, type, data, moment } = item;
                if (!isNil(key) && !isNil(name) && !isNil(type) && !isNil(moment)) {
                    // Create a new DateItem and add it to the collection
                    this.dateItems.push(
                        new DateItem({
                            key,
                            name,
                            type,
                            data: (data as Required<IRomcalDateItemData>) ?? {},
                            moment,
                            _stack: index, // The stack number refers to the index in the calendars array in which this celebration's array is placed at
                            baseItem, // Attach the base item if any
                        }),
                    );
                }
            }),
        );
    }

    /**
     * If a previous date item already exists (has the same key name as the new one),
     * the previous date item will be removed in favour of the new given one,
     * except if the previous item is prioritized but not the new one
     */
    _keepPrioritizedOnly({ key: currentKey, data: currentData }: IRomcalDateItem): void {
        this.dateItems
            .filter(({ key }) => key === currentKey)
            .forEach(({ data: previousData, _id: previousId }) => {
                if (!previousData.prioritized || (previousData.prioritized && currentData?.prioritized)) {
                    // Remove previous item if it isn't priortized
                    // Remove previous item if both items are prioritized.
                    removeWhere(this.dateItems, { _id: previousId });
                }
            });
    }

    /**
     * Sort all DateItems by relevance (the most relevant first)
     * and drop the non-relevant DateItems.
     *
     * Reorder the DateItems of a particular day, so that
     * when there are optional memorials or commemoration only (in addition to the feria),
     * the feria item is moved to the top before the optional items,
     * since it's the default item if none of the optional items are celebrated.
     * Sort all date items by relevance (the most relevant first),
     * in this order: by date, by priority, by type, by stack.
     */
    _sortAndKeepRelevant(): void {
        const types = extractedTypeKeys.slice(0, extractedTypeKeys.length - 1);
        types.splice(types.indexOf("MEMORIAL") + 1, 0, extractedTypeKeys[extractedTypeKeys.length - 1]);
        this.dateItems.sort(
            (
                { moment: firstMoment, data: firstData, type: firstType, _stack: firstStack }: DateItem,
                { moment: nextMoment, data: nextData, type: nextType, _stack: nextStack }: DateItem,
            ): number => {
                // 1. Sort by date
                if (firstMoment.isBefore(nextMoment)) {
                    return -1;
                } else if (firstMoment.isAfter(nextMoment)) {
                    return 1;
                } else {
                    // If the date is the same...
                    // 2. Sort by priority (prioritized first)
                    const { prioritized: firstPrioritized } = firstData;
                    const { prioritized: nextPrioritized } = nextData;
                    if (firstPrioritized && !nextPrioritized) {
                        return -1;
                    } else if (!firstPrioritized && nextPrioritized) {
                        return 1;
                    } else {
                        // If neither date is prioritized
                        // 3. Sort by type (higher type first)
                        const type1 = types.indexOf(Types[firstType] as any);
                        const type2 = types.indexOf(Types[nextType] as any);
                        if (type1 < type2) {
                            return -1;
                        } else if (type1 > type2) {
                            return 1;
                        } else {
                            // If the types are the same
                            // 4. Sort by stack (higher stack first)
                            if (firstStack > nextStack) {
                                return -1;
                            } else if (firstStack < nextStack) {
                                return 1;
                            } else {
                                return 0; // No idea how to sort this...
                            }
                        }
                    }
                }
            },
        );

        // Now that the items are sorted, let's drop other non-relevant date items
        // if at least one of the date items isn't optional...
        // Create a dictionary where celebrations on the same date are grouped under
        // it's ISO string date string as the key and loop through each group to see
        // if there's more than one celebration in each group.
        Object.entries(groupBy(this.dateItems, "date")).forEach(([, dateItems]) => {
            if (dateItems.length > 1) {
                // Validate the first date item
                const [dateItem, ...otherDateItems] = dateItems;
                // If the first date item has a type equal or higher than a MEMORIAL, or is prioritized:
                // keep only the first item and discard all others celebration in the array
                if (
                    dateItem.data.prioritized ||
                    types.indexOf(Types[dateItem.type] as any) <= types.indexOf(Types[Types.MEMORIAL] as any)
                ) {
                    otherDateItems.forEach(({ _id }) => {
                        removeWhere(this.dateItems, { _id });
                    });
                }
            }
        });
    }

    /**
     * Check if 'drop' has been defined for any celebrations in the national calendar
     * and remove them from both national and general calendar sources.
     *
     * @param sources A list of [[IRomcalDateItem]] arrays for the operation
     */
    static _dropItems(sources: Array<Array<IRomcalDateItem>>): Array<Array<IRomcalDateItem>> {
        const dropKeys: string[] = [];
        sources.forEach((source: IRomcalDateItem[]) => {
            source.forEach((dateItem: IRomcalDateItem) => {
                if (dateItem.drop && dateItem.key) {
                    dropKeys.push(dateItem.key);
                }
            });
        });
        return sources.map((source: IRomcalDateItem[]) => {
            return source.filter((dateItem: IRomcalDateItem) => {
                return dateItem.key ? !dropKeys.includes(dateItem.key) : true;
            });
        });
    }

    /**
     * Only retain items within a given date range
     * @param startDate The lower range date to abide by
     * @param endDate The upper range date to abide by
     * @param calendarSources The 2 dimensional array containing various calendar sources to be filtered
     */
    static _filterItemRange(
        startDate: dayjs.Dayjs,
        endDate: dayjs.Dayjs,
        ...calendarSources: Array<Array<IRomcalDateItem>>
    ): Array<Array<IRomcalDateItem>> {
        const start = dayJsToMomentJs(startDate);
        const end = dayJsToMomentJs(endDate);
        return calendarSources.map((calendarSource: Array<IRomcalDateItem>) => {
            return calendarSource.filter((item: IRomcalDateItem) => {
                return item.moment.isSameOrAfter(start) && item.moment.isSameOrBefore(end);
            });
        });
    }

    /**
     * Get the appropriate calendar definition object, based on the given region name and year.
     *
     * @param country The country to get
     * @param year the year to resolve
     */
    static _fetchCalendar(country: TCountryTypes, year: number): Array<IRomcalDateItem> {
        const countryCalendar = CountryCalendars[country];
        return countryCalendar.dates(year);
    }
}

export { calendarFor, queryFor };