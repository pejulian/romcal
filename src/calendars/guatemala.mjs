import moment from 'moment';
import _ from 'lodash';

import { Dates, Utils } from '../lib';
import { Titles, Types, LiturgicalColors } from '../constants';

let dates = year => {

  let _dates = [
  {
    "key": "ourLordJesusChristTheEternalHighPriest",
    "type": Types[4],
    "moment": ( y => Dates.pentecostSunday( y ).add( 4, 'days' ))(year),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  }
  ];

  // Get localized celebration names
  return Utils.localizeDates(_dates);
};

export {
  dates
};
