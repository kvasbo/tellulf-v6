<?php

namespace kvasbo\tellulf;

use GraphQL\Client;
use GraphQL\Exception\QueryError;

define("ENTUR_QUERY", '{
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
}');

class Entur {

  static public function Get(): array {

    $client = new Client(
      'https://api.entur.io/journey-planner/v2/graphql',
      [], 
      [
        'connect_timeout' => 1,
        'timeout' => 1,
        'headers' => 
        [
        'ET-Client-Name' => 'kvasbo-tellulf',
        'Content-Type' => 'application/json'
        ]
    ],
    );

      // Run query to get results
      try {
        $results = $client->runRawQuery(ENTUR_QUERY);
        $data = $results->getData();

        // Only one direction, and only for boarding.
        $trainsFiltered = array_values(array_filter($data->stopPlace->estimatedCalls, function($v) {
          return $v->quay->id === 'NSR:Quay:11518' && $v->forBoarding === true;
        }));

        $callback = function($t) {
          return array(
            'time' => $t->expectedArrivalTime,
            'destination' => $t->destinationDisplay->frontText,
          );
        };

        $trainsFormatted = array_map($callback, $trainsFiltered);
  
        return $trainsFormatted;
  
      }
      catch (QueryError $exception) {
        // Catch query error and desplay error details
        return [];
      }

  }

}