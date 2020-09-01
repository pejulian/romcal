/* eslint-disable @typescript-eslint/no-explicit-any */
/*
    The MIT License (MIT)

    Copyright (c) 2014 Pereira, Julian Matthew

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

import 'jest-extended';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LiturgicalDay } from '@romcal/models/liturgical-day/liturgical-day.model';
import { RomcalLiturgicalDayInput } from '@romcal/models/liturgical-day/liturgical-day.types';
import { Seasons } from '../src/lib/seasons';
import { Dates } from '../src/lib/dates';
import { Ranks } from '@romcal/constants/ranks/ranks.enum';
import Romcal from '@romcal/index';

dayjs.extend(utc);

describe('Testing national calendar overrides', () => {
  describe('An optional celebration is available to be celebrated, in addition to the weekday', () => {
    let generalDates2020: LiturgicalDay[];
    let generalDates2021: LiturgicalDay[];
    let spainDates2020: LiturgicalDay[];

    beforeAll(async () => {
      generalDates2020 = await Romcal.calendarFor({ year: 2020, outputOptionalMemorials: true });
      generalDates2021 = await Romcal.calendarFor({ year: 2021, outputOptionalMemorials: true });
      spainDates2020 = await Romcal.calendarFor({
        year: 2020,
        outputOptionalMemorials: true,
        country: 'spain',
      });
    });

    test('The optional memory of the Most Holy Name of Jesus is available on the 3th of January, in addition to the weekday', () => {
      const dates = generalDates2020.filter((d) => {
        return dayjs.utc(d.date).isSame(dayjs.utc('2020-1-3'));
      });
      expect(dates.length).toEqual(2);
    });
    test('However, if the 3th of January is a Sunday, the Solemnity of Epiphany takes the precedence.', () => {
      const dates = generalDates2021.filter((d) => {
        return dayjs.utc(d.date).isSame(dayjs.utc('2021-1-3'));
      });
      expect(dates.length).toEqual(1);
      expect(dates[0].key).toEqual('epiphany');
    });
    test('The optional memory of Saint Fructuosus is celebrated on the January 20 in Spain, in addition of Saint Fabian & Saint Sebastian from the general calendar', () => {
      const dates = spainDates2020.filter((d) => {
        return dayjs.utc(d.date).isSame(dayjs.utc('2020-1-20'));
      });
      expect(dates.length).toEqual(4);
    });
    test('When optional celebrations are available, the weekday is the first celebration available', () => {
      const [firstDate] = spainDates2020.filter((d) => {
        return dayjs.utc(d.date).isSame(dayjs.utc('2020-1-20'));
      });
      expect(firstDate.rank).toEqual(Ranks.WEEKDAY);
    });
  });

  describe('A feast defined in a national calendar should replace the same feast defined in the general calendar', () => {
    let year: number;
    let generalDates: LiturgicalDay[];
    let spainDates: LiturgicalDay[];

    beforeAll(async () => {
      year = 2008;
      generalDates = await Romcal.calendarFor({ year, outputOptionalMemorials: true });
      spainDates = await Romcal.calendarFor({ year, outputOptionalMemorials: true, country: 'spain' });
    });

    test('The feast of Saint Isidore of Seville is celebrated on April 4 every year', () => {
      const date = generalDates.filter((d) => {
        return (
          dayjs.utc(d.date).isSame(dayjs.utc(`${year}-4-4`)) &&
          d.key === 'isidore_of_seville_bishop'
        );
      });
      expect(date.length).toEqual(1);
    });
    test('However, in the national calendar of Spain, this same feast is celebrated on the 26th of April every year', () => {
      const date = spainDates.filter((d) => {
        return (
          dayjs.utc(d.date).isSame(dayjs.utc(`${year}-4-26`)) &&
          d.key === 'isidore_of_seville_bishop'
        );
      });
      expect(date.length).toEqual(1);
    });
    test('Therefore, national calendar of spain should only have one occurrence of this feast on the 26th of April', () => {
      const occurrences = spainDates.filter((d) => {
        return d.key === 'isidore_of_seville_bishop';
      });
      expect(occurrences.length).toEqual(1);
    });
  });

  describe('Testing the priority option for celebrations', () => {
    let year: number;
    let testDates: LiturgicalDay[];

    beforeAll(async () => {
      year = 2020;
      testDates = await Romcal.calendarFor({
        country: 'test',
        year,
        outputOptionalMemorials: true,
      });
    });

    test('A celebration with a higher type rank and the same key cannot replace an existing prioritized celebration', () => {
      const dates = testDates.filter((d) => {
        return d.key === 'ash_wednesday';
      });
      expect(dates.length).toEqual(1);
      expect(dates[0].rank).toEqual(Ranks.WEEKDAY);
    });

    test('A new prioritized celebration will replace any existing non-prioritized celebrations', () => {
      const dates = testDates.filter((d) => {
        return d.key === 'luke_evangelist';
      });
      expect(dates.length).toEqual(1);
      expect(dates[0].rank).toEqual(Ranks.COMMEMORATION);
    });

    test('An existing and prioritized celebration can be replaced by a new prioritized celebration having the same key (whatever its type rank)', () => {
      const dates = testDates.filter((d) => {
        return dayjs.utc(d.date).isSame(Dates.pentecostSunday(year).add(1, 'day'));
      });
      expect(dates.length).toEqual(1);
      expect(dates[0].key).toEqual('mary_mother_of_the_church');
      expect(dates[0].rank).toEqual(Ranks.OPT_MEMORIAL);
    });

    test('If multiple prioritized celebrations falls the same day, the one with the highest type rank will be used', () => {
      const dates = testDates.filter((d) => {
        return dayjs.utc(d.date).isSame(dayjs.utc('2020-11-9'));
      });
      expect(dates.length).toEqual(1);
      expect(dates[0].key).toEqual('dedication_of_the_lateran_basilica');
      expect(dates[0].rank).toEqual(Ranks.FEAST);
    });

    test('If multiple prioritized celebrations with the same rank fall on the same day, the last defined celebration will be used', () => {
      const dates = testDates.filter((d) => {
        return dayjs.utc(d.date).isSame(dayjs.utc('2020-12-25'));
      });
      expect(dates.length).toEqual(1);
      expect(dates[0].key).toEqual('aSampleCelebration2');
      expect(dates[0].rank).toEqual(Ranks.SOLEMNITY);
    });
  });

  describe('The feast of Epiphany', () => {
    test('Should always be celebrated on January 6 in Slovakia unless explicitly configured otherwise', async () => {
      const slovakiaDates: LiturgicalDay[] = await Romcal.calendarFor({
        country: 'slovakia',
      });
      const epiphanySlovakia = slovakiaDates.find((d) => {
        return d.key === 'epiphany';
      });
      // Should always be Jan 6th in Slovakia
      expect(dayjs.utc(epiphanySlovakia?.date).date()).toEqual(6);
      expect(dayjs.utc(epiphanySlovakia?.date).month()).toEqual(0);
    });
    test('Will fall on Sunday as calculated by the Epiphany rubric, when `epiphanyOnSunday` is explicitly configured as `true`', async () => {
      const slovakiaDates = await Romcal.calendarFor({
        country: 'slovakia',
        epiphanyOnSunday: true,
        year: 2018,
      });
      const epiphanySlovakia = slovakiaDates.find((d) => {
        return d.key === 'epiphany';
      });
      expect(dayjs.utc(epiphanySlovakia?.date).day()).toEqual(0);
      expect(dayjs.utc(epiphanySlovakia?.date).month()).toEqual(0);
    });
  });

  describe('Testing the Feast of Saints Cyril and Methodius with locale specific settings', () => {
    test('Should fall on February 14, 2017 in the general calendar', async () => {
      const dates = await Romcal.calendarFor(2017);
      const date = dates.find((d) => {
        return d.key === 'cyril_the_philosopher_monk_and_methodius_of_thessaloniki_bishop';
      });
      expect(dayjs.utc(date?.date).isSame(dayjs.utc('2017-2-14'))).toBeTruthy();
    });
    test('Should fall on 5th July 2017 in the national calendar of the Czech Republic', async () => {
      const dates = await Romcal.calendarFor({
        country: 'czechRepublic',
        year: 2017,
      });
      const date = dates.find((d) => {
        return d.key === 'cyril_the_philosopher_monk_and_methodius_of_thessaloniki_bishop_secondary_patrons_of_europe';
      });
      expect(dayjs.utc(date?.date).isSame(dayjs.utc('2017-7-5'))).toBeTruthy();
    });
    test('Should fall on 5th July 2017 in the national calendar of Slovakia', async () => {
      const dates = await Romcal.calendarFor({
        country: 'slovakia',
        year: 2017,
      });
      const date = dates.find((d) => {
        return d.key === 'cyril_the_philosopher_monk_and_methodius_of_thessaloniki_bishop_slavic_missionaries';
      });
      expect(dayjs.utc(date?.date).isSame(dayjs.utc('2017-7-5'))).toBeTruthy();
    });
  });

  describe('The feast of the Assumption in England and Wales', () => {
    describe('If the feast of the Assumption falls on Saturday on Monday', () => {
      test('It is transferred to Sunday', async () => {
        const wales2009Dates = await Romcal.calendarFor({
          year: 2009,
          country: 'wales',
        });

        const england2009Dates = await Romcal.calendarFor({
          year: 2009,
          country: 'england',
        });

        const wales2011Dates = await Romcal.calendarFor({
          year: 2011,
          country: 'wales',
        });

        const england2011Dates = await Romcal.calendarFor({
          year: 2011,
          country: 'england',
        });

        const lateOrdinaryTimeDates2009: RomcalLiturgicalDayInput[] = await Seasons.lateOrdinaryTime(2009);
        const lateOrdinaryTimeDates2011: RomcalLiturgicalDayInput[] = await Seasons.lateOrdinaryTime(2011);

        const twentiethSundayOfOrdinaryTime2009: RomcalLiturgicalDayInput | undefined = lateOrdinaryTimeDates2009.find(
          (d) => {
            return d.key === 'twentiethSundayOfOrdinaryTime';
          },
        );

        const twentiethSundayOfOrdinaryTime2011: RomcalLiturgicalDayInput | undefined = lateOrdinaryTimeDates2011.find(
          (d) => {
            return d.key === 'twentiethSundayOfOrdinaryTime';
          },
        );

        const walesAssumption2009: LiturgicalDay | undefined = wales2009Dates.find((d) => {
          return d.key === 'assumption';
        });

        const englandAssumption2009: LiturgicalDay | undefined = england2009Dates.find((d) => {
          return d.key === 'assumption';
        });

        const walesAssumption2011: LiturgicalDay | undefined = wales2011Dates.find((d) => {
          return d.key === 'assumption';
        });

        const englandAssumption2011: LiturgicalDay | undefined = england2011Dates.find((d) => {
          return d.key === 'assumption';
        });

        expect(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          walesAssumption2009?.date === twentiethSundayOfOrdinaryTime2009!.date.toISOString(),
        ).toBeTruthy();
        expect(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          englandAssumption2009?.date === twentiethSundayOfOrdinaryTime2009!.date.toISOString(),
        ).toBeTruthy();
        expect(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          walesAssumption2011?.date === twentiethSundayOfOrdinaryTime2011!.date.toISOString(),
        ).toBeTruthy();
        expect(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          englandAssumption2011?.date === twentiethSundayOfOrdinaryTime2011!.date.toISOString(),
        ).toBeTruthy();
      });
    });

    describe('If the feast of the Assumption falls on Sunday', () => {
      test('It replaces the 20th Sunday of OT', async () => {
        const walesDates = await Romcal.calendarFor({
          year: 2010,
          country: 'wales',
        });

        const englandDates = await Romcal.calendarFor({
          year: 2010,
          country: 'england',
        });

        const lateOrdinaryTimeDates: RomcalLiturgicalDayInput[] = await Seasons.lateOrdinaryTime(2010);
        const twentiethSundayOfOrdinaryTime: RomcalLiturgicalDayInput | undefined = lateOrdinaryTimeDates.find((d) => {
          return d.key === 'twentiethSundayOfOrdinaryTime';
        });

        const walesAssumption: LiturgicalDay | undefined = walesDates.find((d) => d.key === 'assumption');
        const englandAssumption: LiturgicalDay | undefined = englandDates.find((d) => d.key === 'assumption');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(walesAssumption?.date === twentiethSundayOfOrdinaryTime!.date.toISOString()).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(englandAssumption?.date === twentiethSundayOfOrdinaryTime!.date.toISOString()).toBeTruthy();
      });
    });
  });

  describe('The feast of All Saints in England and Wales', () => {
    test('If All Saints is on Saturday, it will be moved to Sunday (the next day)', async () => {
      // In 2008, 1st of November was on a Saturday
      const englandDates = await Romcal.calendarFor({
        country: 'england',
        year: 2008,
      });
      const walesDates = await Romcal.calendarFor({
        country: 'wales',
        year: 2008,
      });
      // So All Saints should be celebrated on Sunday
      const allSaintsEngland = englandDates.find((d) => {
        return d.key === 'all_saints';
      });
      const allSaintsWales = walesDates.find((d) => {
        return d.key === 'all_saints';
      });
      expect(dayjs.utc(allSaintsEngland?.date).day()).toEqual(0);
      expect(dayjs.utc(allSaintsWales?.date).day()).toEqual(0);
    });
  });

  describe('The feast of All Souls in England and Wales', () => {
    test('If All Saints is moved to Sunday, All Souls must be on Monday (the next day)', async () => {
      // In 2008, 1st of November was on a Saturday
      const englandDates = await Romcal.calendarFor({
        country: 'england',
        year: 2008,
      });
      const walesDates = await Romcal.calendarFor({
        country: 'wales',
        year: 2008,
      });
      // So All Saints should be celebrated on Sunday
      // and All Souls will be celebrated on Monday
      const allSaintsEngland = englandDates.find((d) => {
        return d.key === 'all_souls';
      });
      const allSaintsWales = walesDates.find((d) => {
        return d.key === 'all_souls';
      });
      expect(dayjs.utc(allSaintsEngland?.date).day()).toEqual(1);
      expect(dayjs.utc(allSaintsWales?.date).day()).toEqual(1);
    });
  });

  describe('Saint Matthias the Apostle', () => {
    test('Feast day falls on the May 14 in the general liturgical calendar', async () => {
      const dates = await Romcal.calendarFor(2018);
      const matthiasApostle = dates.find((d) => d.key === 'matthias_apostle');
      expect(dayjs.utc(matthiasApostle?.date).isSame(dayjs.utc('2018-5-14'))).toBeTruthy();
    });

    test('Feast day falls on the 24th of February in the national calendar of Germany and Hungary', async () => {
      const germanyDates = await Romcal.calendarFor({
        year: 2018,
        country: 'germany',
        outputOptionalMemorials: true,
      });
      const hungaryDates = await Romcal.calendarFor({
        year: 2018,
        country: 'hungary',
        outputOptionalMemorials: true,
      });

      const matthiasApostleGermany = germanyDates.find((d) => d.key === 'matthias_apostle');
      const matthiasApostleHungary = hungaryDates.find((d) => d.key === 'matthias_apostle');

      expect(dayjs.utc(matthiasApostleGermany?.date).isSame(dayjs.utc('2018-2-24'))).toBeTruthy();
      expect(dayjs.utc(matthiasApostleHungary?.date).isSame(dayjs.utc('2018-2-24'))).toBeTruthy();
    });

    test('Is a memorial in the German liturgical calendar on AD 2014', async () => {
      const germanyDates = await Romcal.calendarFor({
        year: 2014,
        country: 'germany',
      });
      const matthiasApostleGermany = germanyDates.find((d) => d.key === 'matthias_apostle');
      expect(matthiasApostleGermany?.rank).toEqual(Ranks.MEMORIAL);
    });
  });

  describe('Saint Christopher Magallanes and Companions, Martyrs', () => {
    test('A memorial in Mexico but an optional memorial in the general calendar', async () => {
      const mexicoDates = await Romcal.calendarFor({
        year: 2019,
        country: 'mexico',
      });
      const dates = await Romcal.calendarFor({
        year: 2019,
        outputOptionalMemorials: true,
      });
      const christopherMagallanesPriestAndCompanionsMartyrs = dates.find((d) => {
        return d.key === 'christopher_magallanes_priest_and_companions_martyrs';
      });
      const christopherMagallanesPriestAndCompanionsMartyrsMexico = mexicoDates.find((d) => {
        return d.key === 'christopher_magallanes_priest_and_companions_martyrs';
      });
      expect(christopherMagallanesPriestAndCompanionsMartyrs?.rank).toEqual(Ranks.OPT_MEMORIAL);
      expect(christopherMagallanesPriestAndCompanionsMartyrsMexico?.rank).toEqual(Ranks.MEMORIAL);
    });
  });

  describe('Saint Ladislaus', () => {
    test('A feast in Hungary but an optional memorial in Slovakia', async () => {
      const hungaryDates = await Romcal.calendarFor({
        year: 2018,
        country: 'hungary',
        outputOptionalMemorials: true,
      });
      const slovakiaDates = await Romcal.calendarFor({
        year: 2018,
        country: 'slovakia',
        outputOptionalMemorials: true,
      });
      const ladislausIOfHungaryHungary = hungaryDates.find((d) => {
        return d.key === 'ladislaus_i_of_hungary';
      });
      const ladislausIOfHungarySlovakia = slovakiaDates.find((d) => {
        return d.key === 'ladislaus_i_of_hungary';
      });
      expect(ladislausIOfHungaryHungary?.rank).toEqual(Ranks.FEAST);
      expect(ladislausIOfHungarySlovakia?.rank).toEqual(Ranks.OPT_MEMORIAL);
    });
  });

  describe('Our Lady of Sorrows', () => {
    test('Should be celebrated on the September 15, 2018 as a memorial in the General Calendar', async () => {
      const dates = await Romcal.calendarFor(2018);
      const ourLadyOfSorrows = dates.find((d) => {
        return d.key === 'our_lady_of_sorrows';
      });
      expect(ourLadyOfSorrows?.rank).toEqual(Ranks.MEMORIAL);
      expect(dayjs.utc(ourLadyOfSorrows?.date).isSame(dayjs.utc('2018-9-15'))).toBeTruthy();
    });

    test('Should be celebrated on the 15th of April 2015 as a feast in the national calendar of Malta', async () => {
      const maltaDates = await Romcal.calendarFor({
        year: 2015,
        country: 'malta',
      });
      const ourLadyOfSorrows = maltaDates.find((d) => {
        return d.key === 'our_lady_of_sorrows';
      });
      expect(ourLadyOfSorrows?.rank).toEqual(Ranks.FEAST);
      expect(dayjs.utc(ourLadyOfSorrows?.date).isSame(dayjs.utc('2015-4-15'))).toBeTruthy();
    });

    test('Should be replaced by the 3rd Sunday of Easter in 2018 in the national calendar of Malta due to rank', async () => {
      const maltaDates = await Romcal.calendarFor({
        year: 2018,
        country: 'malta',
      });
      const ourLadyOfSorrows: dayjs.Dayjs = dayjs.utc('2018-4-15');
      const thirdSundayOfEaster: LiturgicalDay | undefined = maltaDates.find((d) => d.key === 'thirdSundayOfEaster');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(ourLadyOfSorrows.isSame(thirdSundayOfEaster!.date)).toBeTruthy();
    });

    test('Should be celebrated on the 15th of September 2018 as a solemnity in the national calendar of Slovakia', async () => {
      const slovakiaDates = await Romcal.calendarFor({
        year: 2018,
        country: 'slovakia',
      });
      const ourLadyOfSorrowsPatronessOfSlovakia = slovakiaDates.find((d) => {
        return d.key === 'our_lady_of_sorrows_principal_patroness_of_slovakia';
      });
      expect(ourLadyOfSorrowsPatronessOfSlovakia?.rank).toEqual(Ranks.SOLEMNITY);
      expect(dayjs.utc(ourLadyOfSorrowsPatronessOfSlovakia?.date).isSame(dayjs.utc('2018-9-15'))).toBeTruthy();
    });
  });
});
