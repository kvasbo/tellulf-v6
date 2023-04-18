import { TibberFeed, TibberQuery, IConfig } from 'tibber-api';
import * as z from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export const TibberSubscriptionSchema = z.object({
    timestamp: z.string(),
    power: z.number(),
    accumulatedConsumption: z.number(),
    accumulatedProduction: z.number(),
    accumulatedCost: z.number(),
    minPower: z.number(),
    averagePower: z.number(),
    maxPower: z.number(),
    accumulatedReward: z.number().nullable(),
    powerProduction: z.number().nullable(),
    minPowerProduction: z.number().nullable(),
    maxPowerProduction: z.number().nullable(),
});

export type TibberData = z.infer<typeof TibberSubscriptionSchema>;

const tibberKey: string = process.env.TIBBER_KEY
    ? process.env.TIBBER_KEY.toString()
    : '';

const homeId: string = process.env.TIBBER_ID_HOME
    ? process.env.TIBBER_ID_HOME.toString()
    : '';

const cabinId: string = process.env.TIBBER_ID_CABIN
    ? process.env.TIBBER_ID_CABIN.toString()
    : '';

// Config object needed when instantiating TibberQuery
const configBase: IConfig = {
    // Endpoint configuration.
    apiEndpoint: {
        apiKey: tibberKey,
        queryUrl: 'https://api.tibber.com/v1-beta/gql',
        // requestTimeout: 5000,
    },
    // Query configuration.
    timestamp: true,
    power: true,
    accumulatedConsumption: true,
    accumulatedProduction: true,
    accumulatedCost: true,
    accumulatedReward: true,
    minPower: true,
    averagePower: true,
    maxPower: true,
    powerProduction: true,
    minPowerProduction: true,
    maxPowerProduction: true,
    active: true,
};

const configHome: IConfig = { ...configBase, homeId: homeId };

const configCabin: IConfig = { ...configBase, homeId: cabinId };

// Instance of TibberQuery
const tibberQueryHome = new TibberQuery(configHome);
const tibberQueryCabin = new TibberQuery(configCabin);

const tibberFeedHome = new TibberFeed(tibberQueryHome, 5000);
const tibberFeedCabin = new TibberFeed(tibberQueryCabin, 5000);

export class Tibber {
    private powerData: { home?: TibberData; cabin?: TibberData } = {};

    public constructor() {
        console.log('Tibber init');
        tibberFeedHome.on('data', (data) => {
            this.parseData(data, 'home');
        });
        tibberFeedCabin.on('data', (data) => {
            this.parseData(data, 'cabin');
        });
        tibberFeedCabin.connect();
        tibberFeedHome.connect();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public parseData(data: any, where: 'home' | 'cabin'): void {
        const tibberValidated = TibberSubscriptionSchema.safeParse(data);
        if (tibberValidated.success) {
            this.powerData[where] = tibberValidated.data;
        }
    }
}
