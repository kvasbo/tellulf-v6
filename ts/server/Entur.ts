import { GraphQLClient } from 'graphql-request';
import * as z from 'zod';

// Define API schema
const EnturCallSchema = z.object({
    stopPlace: z.object({
        id: z.string(),
        name: z.string(),
        estimatedCalls: z.array(
            z.object({
                realtime: z.boolean(),
                aimedArrivalTime: z.string(),
                aimedDepartureTime: z.string(),
                expectedArrivalTime: z.string(),
                expectedDepartureTime: z.string(),
                actualArrivalTime: z.string().nullable(),
                actualDepartureTime: z.string().nullable(),
                date: z.string(),
                forBoarding: z.boolean(),
                forAlighting: z.boolean(),
                destinationDisplay: z.object({
                    frontText: z.string(),
                }),
                quay: z.object({ id: z.string() }),
                serviceJourney: z.object({
                    journeyPattern: z.object({
                        line: z.object({
                            id: z.string(),
                            name: z.string(),
                            transportMode: z.string(),
                        }),
                    }),
                }),
            })
        ),
    }),
});

export interface Train {
    time: string;
    destination: string;
}

type EnturCall = z.infer<typeof EnturCallSchema>;

const ENTUR_QUERY = `
{
  stopPlace(id: "NSR:StopPlace:58268") {
    id
    name
    estimatedCalls(timeRange: 72100, numberOfDepartures: 10) {     
      realtime
      aimedArrivalTime
      aimedDepartureTime
      expectedArrivalTime
      expectedDepartureTime
      actualArrivalTime
      actualDepartureTime
      date
      forBoarding
      forAlighting
      destinationDisplay {
        frontText
      }
      quay {
        id
      }
      serviceJourney {
        journeyPattern {
          line {
            id
            name
            transportMode
          }
        }
      }
    }
  }
}`;

export class Entur {
    private trains: Train[] = [];

    public constructor() {
        this.Update();
        setInterval(() => {
            this.Update();
        }, 60000);
    }

    public Get(): Train[] {
        return this.trains;
    }

    async Update(): Promise<void> {
        const client = new GraphQLClient(
            'https://api.entur.io/journey-planner/v2/graphql',
            {
                headers: {
                    'ET-Client-Name': 'kvasbo-tellulf',
                    'Content-Type': 'application/json',
                },
            }
        );

        try {
            const data: EnturCall = await client.request(ENTUR_QUERY);

            // Safely parse data
            const res = EnturCallSchema.safeParse(data);

            if (!res.success) {
                this.trains = [];
                return;
            }

            const trainsFiltered = res.data.stopPlace.estimatedCalls.filter(
                (call) => {
                    return (
                        call.quay.id === 'NSR:Quay:11518' &&
                        call.forBoarding === true
                    );
                }
            );

            const trainsFormatted: Train[] = trainsFiltered.map((train) => {
                return {
                    time: train.expectedArrivalTime,
                    destination: train.destinationDisplay.frontText,
                };
            });
            this.trains = trainsFormatted;
        } catch (error) {
            console.error(error);
            this.trains = [];
        }
    }
}
