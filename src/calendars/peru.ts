import dayjs from 'dayjs';

import * as Locales from '@romcal/lib/locales';
import { Dates } from '@romcal/lib/dates';
import { LiturgicalColors } from '@romcal/constants/liturgical-colors/liturgical-colors.enum';
import { RomcalLiturgicalDayInput } from '@romcal/models/liturgical-day/liturgical-day.types';
import { RomcalConfig, RomcalConfigInCalendarDef } from '@romcal/models/config/config.model';
import { Ranks } from '@romcal/constants/ranks/ranks.enum';
import { CelebrationsCycle } from '@romcal/constants/cycles/cycles.enum';

const defaultConfig: RomcalConfigInCalendarDef | undefined = undefined;

const dates = async (config: RomcalConfig): Promise<Array<RomcalLiturgicalDayInput>> => {
  const year = config.year;
  const _dates: Array<RomcalLiturgicalDayInput> = [
    {
      key: 'finding_of_the_holy_cross',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-5-3`),
    },
    {
      key: 'our_lady_help_of_christians',
      rank: Ranks.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-5-24`),
    },
    {
      key: 'saintMarianaDeJesusDeParedesVirgin',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-5-26`),
    },
    {
      key: 'francis_solanus_priest',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-7-14`),
    },
    {
      key: 'our_lady_of_peace',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-7-28`),
    },
    {
      key: 'saintRoseOfLima',
      rank: Ranks.SOLEMNITY,
      date: dayjs.utc(`${year}-8-23`),
    },
    {
      key: 'john_macias_religious',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-9-18`),
    },
    {
      key: 'our_lady_of_mercy',
      rank: Ranks.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-9-24`),
    },
    {
      key: 'our_lord_of_miracles',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-10-28`),
    },
    {
      key: 'saintMartinDePorresReligious',
      rank: Ranks.SOLEMNITY,
      date: dayjs.utc(`${year}-11-3`),
    },
    {
      key: 'our_lady_of_guadalupe',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-12-12`),
    },
    {
      key: 'our_lord_jesus_christ_the_eternal_high_priest',
      rank: Ranks.FEAST,
      date: ((y: number): dayjs.Dayjs => dayjs.utc(Dates.pentecostSunday(y).add(4, 'day').toISOString()))(year),
      liturgicalColors: LiturgicalColors.WHITE,
      cycles: { celebrationCycle: CelebrationsCycle.TEMPORALE },
    },
  ];

  // Get localized liturgical day names
  return await Locales.localizeDates(_dates);
};

export { dates, defaultConfig };
