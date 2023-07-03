import * as z from 'zod';

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
