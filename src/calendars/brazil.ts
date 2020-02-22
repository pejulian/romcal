import moment from "moment";

import { Locales } from "../lib";
import { Titles, Types, LiturgicalColors } from "../constants";
import { IRomcalDateItem } from "../models/romcal-date-item";
import { IRomcalDefaultConfig } from "../models/romcal-config";

const defaultConfig: IRomcalDefaultConfig | undefined = undefined;

const dates = (year: number): Array<IRomcalDateItem> => {
    const _dates: Array<IRomcalDateItem> = [
        {
            key: "saintJoseDeAnchietaPriest",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 5, day: 9 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
        {
            key: "blessedAlbertinaBerkenbrockVirginAndMartyr",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 5, day: 15 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.RED,
                    titles: [Titles.MARTYR],
                },
            },
        },
        {
            key: "saintPaulinaOfTheAgonizingHeartOfJesusVirgin",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 6, day: 9 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
        {
            key: "ourLadyOfMountCarmel",
            type: Types.FEAST,
            moment: moment.utc({ year, month: 6, day: 16 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
        {
            key: "blessedInacioDeAzevedoPriestAndCompanionsMartyrs",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 6, day: 17 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.RED,
                    titles: [Titles.MARTYR],
                },
            },
        },
        {
            key: "saintRoseOfLima",
            type: Types.FEAST,
            moment: moment.utc({ year, month: 7, day: 23 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
        {
            key: "blessedsAndreDeSoveralAndAmbrosioFranciscoFerroPriestsAndMartyrs",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 9, day: 3 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.RED,
                    titles: [Titles.MARTYR],
                },
            },
        },
        {
            key: "ourLadyOfAparecidaPatronessOfBrazil",
            type: Types.SOLEMNITY,
            moment: moment.utc({ year, month: 9, day: 12 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
        {
            key: "saintAnthonyOfSaintAnneGalvaoFreiGalvaoPriest",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 9, day: 25 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
        {
            key: "saintsRoqueGonzalezAlfonsoRodriguezOlmedoAndJuanDelCastilloPriestsAndMartyrs",
            type: Types.MEMORIAL,
            moment: moment.utc({ year, month: 10, day: 19 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.RED,
                    titles: [Titles.MARTYR],
                },
            },
        },
        {
            key: "ourLadyOfGuadalupe",
            type: Types.FEAST,
            moment: moment.utc({ year, month: 11, day: 12 }),
            data: {
                meta: {
                    liturgicalColor: LiturgicalColors.WHITE,
                },
            },
        },
    ];

    // Get localized celebration names
    return Locales.localizeDates(_dates);
};

export { dates, defaultConfig };