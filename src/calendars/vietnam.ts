import dayjs from 'dayjs';

import * as Locales from '@romcal/lib/locales';
import { LiturgicalColors } from '@romcal/constants/liturgical-colors/liturgical-colors.enum';
import { LiturgicalDayInput } from '@romcal/models/liturgical-day/liturgical-day.types';
import { RomcalConfig, RomcalConfigInCalendarDef } from '@romcal/models/config/config.model';
import { Ranks } from '@romcal/constants/ranks/ranks.enum';
import { Titles } from '@romcal/constants/titles/titles.enum';

const defaultConfig: RomcalConfigInCalendarDef = {
  ascensionOnSunday: true,
  corpusChristiOnSunday: true,
  epiphanyOnSunday: true,
};

const dates = async (config: RomcalConfig): Promise<Array<LiturgicalDayInput>> => {
  const year = config.year;
  const _dates: Array<LiturgicalDayInput> = [
    {
      key: 'andrew_dung_lac_priest_and_companions_martyrs',
      rank: Ranks.SOLEMNITY,
      date: dayjs.utc(`${year}-11-24`),
      liturgicalColors: LiturgicalColors.RED,
      metadata: {
        titles: [Titles.MARTYR],
      },
    },
    {
      key: 'joseph_spouse_of_mary',
      rank: Ranks.SOLEMNITY,
      date: dayjs.utc(`${year}-03-19`),
      liturgicalColors: LiturgicalColors.WHITE,
      metadata: {},
    },
    {
      key: 'blessed_andrew_of_phu_yen',
      rank: Ranks.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-07-26`),
      liturgicalColors: LiturgicalColors.RED,
      metadata: {
        titles: [Titles.MARTYR],
      },
    },
    {
      key: 'therese_of_the_child_jesus_and_the_holy_face_of_lisieux_virgin',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-10-01`),
      liturgicalColors: LiturgicalColors.WHITE,
      metadata: {
        titles: [Titles.DOCTOR_OF_THE_CHURCH],
      },
    },
    {
      key: 'therese_of_the_child_jesus_and_the_holy_face_of_lisieux_virgin',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-10-01`),
      liturgicalColors: LiturgicalColors.RED,
      metadata: {
        titles: [Titles.DOCTOR_OF_THE_CHURCH],
      },
    },
    {
      key: 'our_lady_of_the_rosary',
      rank: Ranks.SOLEMNITY,
      date: 
      // First Sunday of October
        const firstDay = dayjs.utc(`${year}-10-1`);
        const solemnity = 8 - (firstDay.day() == 0 ? 7 : firstDay.day());
        return dayjs.utc(`${year}-1-${solemnity}`);
      })(),
      liturgicalColors: LiturgicalColors.WHITE,
    },
    {
      key: 'francis_xavier_priest',
      rank: Ranks.FEAST,
      date: dayjs.utc(`${year}-12-3`),
      liturgicalColors: LiturgicalColors.WHITE,
  ];

  // Get localized liturgical day names
  return await Locales.localizeDates(_dates);
};

export { dates, defaultConfig };
