import { GraphQLClient, request } from 'graphql-request';

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

interface Train {
  time: string;
  destination: string;
}

export class Entur {
  static async Get(): Promise<Train[]> {
    const client = new GraphQLClient('https://api.entur.io/journey-planner/v2/graphql', {
      headers: {
        'ET-Client-Name': 'kvasbo-tellulf',
        'Content-Type': 'application/json',
      },
      timeout: 1000,
    });

    try {
      const data: any = await client.request(ENTUR_QUERY);

      const trainsFiltered = data.stopPlace.estimatedCalls.filter((call: any) => {
        return call.quay.id === 'NSR:Quay:11518' && call.forBoarding === true;
      });

      const trainsFormatted: Train[] = trainsFiltered.map((train: any) => {
        return {
          time: train.expectedArrivalTime,
          destination: train.destinationDisplay.frontText,
        };
      });

      return trainsFormatted;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
