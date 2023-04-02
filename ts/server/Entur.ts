import { GraphQLClient } from 'graphql-request';

interface EnturData {
    stopPlace: {
        id: string;
        name: string;
        estimatedCalls: EnturCall[];
    };
}

export interface Train {
    time: string;
    destination: string;
}

interface EnturCall {
    realtime: boolean;
    aimedArrivalTime: string;
    aimedDepartureTime: string;
    expectedArrivalTime: string;
    expectedDepartureTime: string;
    actualArrivalTime: string | null;
    actualDepartureTime: string | null;
    date: string;
    forBoarding: boolean;
    forAlighting: boolean;
    destinationDisplay: { frontText: string };
    quay: { id: string };
    // There is more data here, but we don't need it
}

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
                timeout: 1000,
            }
        );

        try {
            const data: EnturData = await client.request(ENTUR_QUERY);

            const trainsFiltered = data.stopPlace.estimatedCalls.filter(
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
