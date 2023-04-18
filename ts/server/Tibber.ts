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
    public powerData: { home: TibberData; cabin: TibberData } = {
        home: {
            timestamp: '',
            power: 0,
            accumulatedConsumption: 0,
            accumulatedProduction: 0,
            accumulatedCost: 0,
            minPower: 0,
            averagePower: 0,
            maxPower: 0,
            accumulatedReward: 0,
            powerProduction: 0,
            minPowerProduction: 0,
            maxPowerProduction: 0,
        },
        cabin: {
            timestamp: '',
            power: 0,
            accumulatedConsumption: 0,
            accumulatedProduction: 0,
            accumulatedCost: 0,
            minPower: 0,
            averagePower: 0,
            maxPower: 0,
            accumulatedReward: 0,
            powerProduction: 0,
            minPowerProduction: 0,
            maxPowerProduction: 0,
        },
    };

    // Create Tibber instances and start subscriptions
    public constructor() {
        tibberFeedHome.on('data', (data) => {
            this.parseData(data, 'home');
            console.log(this.powerData.cabin);
        });
        tibberFeedCabin.on('data', (data) => {
            this.parseData(data, 'cabin');
        });
        tibberFeedCabin.connect().then(() => {
            console.log('Tibber cabin initiated');
        });
        tibberFeedHome.connect().then(() => {
            console.log('Tibber home initiated');
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public parseData(data: any, where: 'home' | 'cabin'): void {
        const tibberValidated = TibberSubscriptionSchema.safeParse(data);
        if (tibberValidated.success) {
            // Overwrite but keep power production as it tends to be null
            const oldData = this.powerData[where];
            this.powerData[where] = tibberValidated.data;
            if (!tibberValidated.data.powerProduction) {
                this.powerData[where].powerProduction = oldData.powerProduction;
            }
        } else {
            console.log('Tibber data not valid');
        }
    }
}
