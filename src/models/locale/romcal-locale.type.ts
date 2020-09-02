import { RomcalLiturgicalColor } from '@romcal/constants/liturgical-colors/liturgical-colors.type';

export type RomcalLocaleKeys = {
  after: string;
  before: string;
  day: string;
  day_after_ash_wed: string;
  weekday: string;
  octave: string;
  season: string;
  sunday: string;
};

/**
 * The contract that defines the properties of a Romcal compliant locale file.
 */
export interface RomcalLocale {
  readonly advent?: Pick<RomcalLocaleKeys, 'weekday' | 'season' | 'sunday'>;
  readonly christmastide?: Pick<RomcalLocaleKeys, 'day' | 'octave' | 'season' | 'sunday'>;
  readonly epiphany?: Pick<RomcalLocaleKeys, 'after' | 'before' | 'season'>;
  readonly ordinaryTime?: Pick<RomcalLocaleKeys, 'weekday' | 'season' | 'sunday'>;
  readonly lent?: Pick<RomcalLocaleKeys, 'weekday' | 'season' | 'sunday' | 'day_after_ash_wed'>;
  readonly holyWeek?: Pick<RomcalLocaleKeys, 'weekday' | 'season'>;
  readonly eastertide?: Pick<RomcalLocaleKeys, 'weekday' | 'octave' | 'season' | 'sunday'>;
  readonly celebrations?: {
    readonly [key: string]: string;
  };
  readonly sanctoral?: {
    readonly [key: string]: string;
  };
  readonly liturgicalColors?: {
    readonly [key in RomcalLiturgicalColor]?: string;
  };
}
