import dayjs from 'dayjs';

import * as Locales from '@romcal/lib/Locales';
import * as Dates from '@romcal/lib/Dates';
import { LITURGICAL_COLORS } from '@romcal/constants/liturgical-colors.constant';
import { RomcalDateItemInput } from '@romcal/models/romcal-date-item';
import Config, { IRomcalDefaultConfig } from '@romcal/models/romcal-config';
import { TypesEnum } from '@romcal/enums/types.enum';

const defaultConfig: IRomcalDefaultConfig | undefined = undefined;

const dates = async (config: Config): Promise<Array<RomcalDateItemInput>> => {
  const year = config.year;
  const _dates: Array<RomcalDateItemInput> = [
    {
      key: 'ourLordJesusChristTheEternalHighPriest',
      type: TypesEnum.FEAST,
      date: ((y: number): dayjs.Dayjs =>
        dayjs.utc(
          Dates.pentecostSunday(y)
            .add(4, 'day')
            .toISOString(),
        ))(year),
      data: {
        meta: {
          liturgicalColor: LITURGICAL_COLORS.WHITE,
        },
      },
    },
  ];

  // Get localized celebration names
  return await Locales.localizeDates(_dates);
};

export { dates, defaultConfig };
