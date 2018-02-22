import moment from 'moment';
import range from 'moment-range';
import _ from 'lodash';

import { Dates, Utils } from '../lib';
import { Titles, Types, LiturgicalColors } from '../constants';

let _dates = [
  {
    "key": "blessedJosephVazPriest",
    "type": Types[6],
    "moment": moment.utc({ year: arguments[0], month: 0, day: 16 }),
    "data": {}
  },
  {
    "key": "ourLadyOfLanka",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 1, day: 4 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  },
  {
    "key": "ourLadyOfMadhu",
    "type": Types[4],
    "moment": moment.utc({ year: arguments[0], month: 6, day: 2 }),
    "data": {
      "meta": {
        "liturgicalColor": LiturgicalColors.WHITE
      }
    }
  }
];

let dates = () => {
  // Get localized celebration names
  return _.map( _dates, date => {
    date.name = Utils.localize({
      key: 'national.' + date.key
    });
    return date;
  });
};

export {
  dates 
};
