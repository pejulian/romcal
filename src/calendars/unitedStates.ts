import dayjs from 'dayjs';

import { Locales } from '../lib';
import { Titles, Types, LiturgicalColors } from '../constants';
import { IRomcalDateItem } from '../models/romcal-date-item';
import Config, { IRomcalDefaultConfig } from '../models/romcal-config';

const defaultConfig: IRomcalDefaultConfig | undefined = undefined;

const dates = async (config: Config): Promise<Array<IRomcalDateItem>> => {
  const year = config.year;
  const _dates: Array<IRomcalDateItem> = [
    {
      key: 'saintElizabethAnnSetonReligious',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-1-4`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.WHITE,
        },
      },
    },
    {
      key: 'saintJohnNeumannBishop',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-1-5`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.WHITE,
        },
      },
    },
    {
      key: 'saintAndreBessetteReligious',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-1-6`),
      data: {},
    },
    {
      key: 'saintVincentDeaconAndMartyr',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-1-22`),
      data: {
        meta: {
          titles: [Titles.MARTYR],
        },
      },
    },
    {
      key: 'saintMarianneCopeVirgin',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-1-22`),
    },
    {
      key: 'saintKatharineDrexelVirgin',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-3-3`),
      data: {},
    },
    {
      key: 'saintDamienDeVeusterPriest',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-5-10`),
      data: {},
    },
    {
      key: 'saintIsidoreTheFarmer',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-5-15`),
      data: {},
    },
    {
      key: 'blessedJuniperoSerraPriest',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-7-1`),
      data: {},
    },
    {
      key: 'saintKateriTekakwithaVirgin',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-7-14`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.WHITE,
        },
      },
    },
    {
      key: 'saintCamillusDeLellisPriest',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-7-18`),
      data: {},
    },
    {
      key: 'saintPeterClaverPriest',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-9-9`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.WHITE,
        },
      },
    },
    {
      key: 'blessedMarieRoseDurocherVirgin',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-10-6`),
      data: {},
    },
    {
      key: 'saintsJeanDeBrebeufAndIsaacJoguesPriestsAndCompanionsMartyrs',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-10-19`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.RED,
          titles: [Titles.MARTYR],
        },
      },
    },
    {
      key: 'saintPaulOfTheCrossPriest',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-10-19`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.RED,
          titles: [Titles.MARTYR],
        },
      },
    },
    {
      key: 'saintPaulOfTheCrossPriest',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-10-20`),
      data: {},
    },
    {
      key: 'saintFrancesXavierCabriniVirgin',
      type: Types.MEMORIAL,
      date: dayjs.utc(`${year}-11-13`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.WHITE,
        },
      },
    },
    {
      key: 'saintRosePhilippineDuchesneVirgin',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-11-18`),
      data: {},
    },
    {
      key: 'blessedMiguelAgustinProPriestAndMartyr',
      type: Types.OPT_MEMORIAL,
      date: dayjs.utc(`${year}-11-23`),
      data: {
        meta: {
          titles: [Titles.MARTYR],
        },
      },
    },
    {
      key: 'ourLadyOfGuadalupe',
      type: Types.FEAST,
      date: dayjs.utc(`${year}-12-12`),
      data: {
        meta: {
          liturgicalColor: LiturgicalColors.WHITE,
        },
      },
    },
  ];

  // Get localized celebration names
  return await Locales.localizeDates(_dates);
};

export { dates, defaultConfig };
