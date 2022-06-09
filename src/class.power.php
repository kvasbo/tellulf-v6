<?php

namespace kvasbo\tellulf;

use GraphQL\Client;

define("TIBBER_QUERY", "{
  viewer {
    homes {
      timeZone
      address {
        address1
      }
      consumption(resolution: HOURLY, last: %d) {
        nodes {
          from
          to
          cost
          unitPrice
          unitPriceVAT
          consumption
          consumptionUnit
        }
      }
      currentSubscription {
        status
        priceInfo {
          current {
            total
            energy
            tax
            startsAt
          }
        }
      }
    }
  }
}
");

class Power {
  
  /**
   * Get_Consumption
   *
   * @return array
   */
  static public function Get_Consumption(): array {
    try {
      return static::Get_From_Tibber();
    } catch (\Throwable $e) {
      return [];
    }
  }
  
  /**
   * Get_From_Tibber
   *
   * @return void
   */
  static private function Get_From_Tibber(): array {
    $query = sprintf(TIBBER_QUERY, date('H'));
    $client = new Client(
      'https://api.tibber.com/v1-beta/gql', ['Authorization' => 'Bearer '.$_ENV["TIBBER_KEY"]]
    );

    // Run query to get results
    try {
      
      $results = $client->runRawQuery($query);

      $data = $results->getData()->viewer->homes;

      return static::Parse_Tibber($data);

    }
    catch (\Throwable $exception) {
      // Catch query error and desplay error details
      return [];
    }
  }

  /**
   * 
   * @param array $data Tibber return data.
   * @return array result.
   */
  private static function Parse_Tibber(array $data): array {
    
    $out = [];
    
    foreach($data as $home) {
      $used = 0;
      $cost = 0;
     
      $price = $home->currentSubscription->priceInfo->current->total;

      foreach($home->consumption as $c) {
        foreach ($c as $h) {
          $cost += $h->cost;
          $used += $h->consumption;
        }
      }

      $address = mb_strtolower($home->address->address1);

      switch ($address) {
        case 'dalsveien 70e':
          $key = "hjemme";
          break;

        case 'øståsveien 14':
          $key = "hytta";
          break;
        
        default:
          $key = $address;
          break;
      }

      $out[$key] = array(
        'address' => ucfirst($address),
        'cost' => $cost,
        'used' => $used,
        'price' => $price,
      );
    }

    return $out;
  }

}