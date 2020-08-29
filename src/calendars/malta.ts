import dayjs from 'dayjs';

import * as Locales from '@romcal/lib/locales';
import { LiturgicalColors } from '@romcal/constants/liturgical-colors/liturgical-colors.enum';
import { RomcalLiturgicalDayInput } from '@romcal/models/liturgical-day/liturgical-day.types';
import { RomcalConfig, RomcalConfigInCalendarDef } from '@romcal/models/config/config.model';
import { Ranks } from '@romcal/constants/ranks/ranks.enum';
import { Titles } from '@romcal/constants/titles/titles.enum';

const defaultConfig: RomcalConfigInCalendarDef | undefined = undefined;

const dates = async (config: RomcalConfig): Promise<Array<RomcalLiturgicalDayInput>> => {
  const year = config.year;
  const _dates: Array<RomcalLiturgicalDayInput> = [
    {
      key: 'publius_of_malta_bishop',
      rank: Ranks.MEMORIAL,
      date: dayjs.utc(`${year}-1-22`),
    },
    {
      key: 'shipwreckOfSaintPaulApostle',
      rank: Ranks.SOLEMNITY,
      date: dayjs.utc(`${year}-2-10`),
    },
    {
      key: 'cyril_the_philosopher_monk_and_methodius_of_thessaloniki_bishop',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-2-14`),
      liturgicalColors: LiturgicalColors.WHITE,
      metadata: {
        titles: [Titles.PATRON_OF_EUROPE],
      },
    },
    {
      key: 'mary_adeodata_pisani_virgin',
      rank: Ranks.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-2-25`),
    },
    {
      key: 'our_lady_of_sorrows',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-4-15`),
    },
    {
      key: 'catherine_of_siena_virgin',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-4-29`),
      metadata: {
        titles: [Titles.DOCTOR_OF_THE_CHURCH, Titles.PATRON_OF_EUROPE],
      },
    },
    {
      key: 'pius_v_pope',
      rank: Ranks.MEMORIAL,
      date: dayjs.utc(`${year}-4-30`),
    },
    {
      key: 'george_preca_priest',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-5-9`),
    },
    {
      key: 'ignatius_falzon',
      rank: Ranks.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-7-1`),
    },
    {
      key: 'benedict_of_nursia_abbot',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-7-11`),
    },
    {
      key: 'our_lady_of_mount_carmel',
      rank: Ranks.MEMORIAL,
      date: dayjs.utc(`${year}-7-16`),
    },
    {
      key: 'bridget_of_sweden_religious',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-7-23`),
      liturgicalColors: LiturgicalColors.WHITE,
      metadata: {
        titles: [Titles.PATRON_OF_EUROPE],
      },
    },
    {
      key: 'teresa_benedicta_of_the_cross_stein_virgin',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-8-9`),
      liturgicalColors: LiturgicalColors.RED,
      metadata: {
        titles: [Titles.MARTYR, Titles.PATRON_OF_EUROPE],
      },
    },
    {
      key: 'catherine_of_alexandria_virgin',
      rank: Ranks.MEMORIAL,
      date: dayjs.utc(`${year}-11-25`),
      liturgicalColors: LiturgicalColors.RED,
      metadata: {
        titles: [Titles.MARTYR],
      },
    },
  ];

  // Get localized liturgical day names
  return await Locales.localizeDates(_dates);
};

export { dates, defaultConfig };
