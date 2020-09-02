import { RomcalLocale } from '@romcal/models/locale/romcal-locale.type';

export default {
  advent: {
    season: 'Advent',
    weekday: '{{day}} of the {{week}} week of Advent',
    sunday: '{{week}} Sunday of Advent',
  },
  christmastide: {
    season: 'Christmastide',
    day: '{{day}} of Christmastide',
    octave: '{{count}} Day of Christmas Octave',
    sunday: '{{count}} Sunday of Christmas',
  },
  lent: {
    season: 'Lent',
    weekday: '{{day}} of the {{week}} week of Lent',
    sunday: '{{week}} Sunday of Lent',
    day_after_ash_wed: '{{day}} after Ash Wednesday',
  },
  eastertide: {
    season: 'Eastertide',
    weekday: '{{day}} of the {{week}} week of Easter',
    sunday: '{{week}} Sunday of Easter',
    octave: '{{day}} within the Octave of Easter',
  },
  celebrations: {
    corpus_christi: 'Most Holy Body and Blood of the Lord',
    holy_thursday: 'Maundy Thursday',
  },
  sanctoral: {
    raymond_of_penyafort_priest: 'Saint Raymond of Peñafort, Priest',
    seven_holy_founders_of_the_servite_order: 'Seven Founders of the Order of Servants of the Blessed Virgin Mary',
    louis_grignion_de_montfort_priest: 'Saint Louis Marie Grignion de Montfort, Priest',
    pius_v_pope: 'Saint Pius V, Pope and Religious',  // TODO: This key should be removed after one can add titles within celebration definions
    paulina_of_the_agonizing_heart_of_jesus_visintainer_virgin: 'Saint Paulina of the Agonising Heart of Jesus Visintainer, Virgin',
    bernardine_of_siena_priest: 'Saint Bernardine of Siena, Priest, Religious and Missionary',  // TODO: This key should be removed after one can add titles within celebration definions
  },
} as RomcalLocale;
