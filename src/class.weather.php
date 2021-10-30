<?php

namespace kvasbo\tellulf;

require_once "./kok/ical.php";

class Weather
{

  private $forecast;
  public $nowcast;
  
  public function __construct() {
	  $this->forecast = static::Fetch_Forecast();
	  $this->nowcast = static::Fetch_Nowcast();
  }	
	
  private static function Fetch_Forecast()
  {
	// Fetch and decode JSON
  	$data = file_get_contents($_ENV["YR_URL_FORECAST"], false, static::Get_Yr_Context());
  	$forecast = json_decode($data);
	  
	$return = [];
	  
	foreach($forecast->properties->timeseries as $series) {
		
		// Parse the time and handle time zones
		$time = strtotime($series->time);
		$date_data = \date_parse(date( "Y-m-d H:i:s", $time));

		if($date_data['hour'] % 6 === 1 && !empty($series->data->next_6_hours->details)) {

			// Init array
			if (empty($return[$date_data['day']])) {
				$return[$date_data['day']] = [];
			}
			
			// Build return data set
			$return[$date_data['day']][$date_data['hour']] = array(
				"symbol" => $series->data->next_6_hours->summary->symbol_code,
				"details" => $series->data->next_6_hours->details
			);
			
			// echo "<pre>".htmlentities(print_r($date_data, true))."</pre>";
			// echo "<pre>".htmlentities(print_r($series, true))."</pre>";
		}
		
	}
	return $return;
	  
  }

  private static function Fetch_Nowcast()
  {
  	$data = file_get_contents($_ENV["YR_URL_NOWCAST"], false, static::Get_Yr_Context());
	$nowcast = json_decode($data);
	return array(
		'temperature' => $nowcast->properties->timeseries[0]->data->instant->details->air_temperature,
		'symbol' => $nowcast->properties->timeseries[0]->data->next_1_hours->summary->symbol_code
	);
  }
  
  /**
  *	Generate a context to make met.no happy
  */
  private static function Get_Yr_Context() {
	  // Create a stream
	  $opts = [
		  "http" => [
			  "method" => "GET",
			  'user_agent' => "tellulf v6: audun@kvasbo.no"
		  ]
	  ];
	  
	  // DOCS: https://www.php.net/manual/en/function.stream-context-create.php
	  $context = stream_context_create($opts);
	  
	  return $context;
  }
  
}
