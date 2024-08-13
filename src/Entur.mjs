import { gql, request } from "graphql-request";
import * as z from "zod";

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
      }),
    ),
  }),
});

const ENTUR_QUERY = gql`
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
  }
`;

export class Entur {
  trains = [];

  constructor() {
    this.Update();
    setInterval(() => {
      this.Update();
    }, 60000);
  }

  Get() {
    return this.trains;
  }

  async Update() {
    try {
      const data = await request({
        url: "https://api.entur.io/journey-planner/v2/graphql",
        document: ENTUR_QUERY,
        requestHeaders: {
          "ET-Client-Name": "kvasbo-tellulf",
          "Content-Type": "application/json",
        },
      });

      // Safely parse data
      const res = EnturCallSchema.safeParse(data);

      if (!res.success) {
        this.trains = [];
        return;
      }

      const trainsFiltered = res.data.stopPlace.estimatedCalls.filter(
        (call) => {
          return call.quay.id === "NSR:Quay:11518" && call.forBoarding === true;
        },
      );

      const trainsFormatted = trainsFiltered.map((train) => {
        return {
          time: train.expectedArrivalTime,
          destination: train.destinationDisplay.frontText,
        };
      });
      console.group("Entur API data received");
      console.log(trainsFormatted);
      console.groupEnd();
      this.trains = trainsFormatted;
    } catch (error) {
      console.error(error);
      this.trains = [];
    }
  }
}
