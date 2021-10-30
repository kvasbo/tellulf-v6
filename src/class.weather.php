<?php

namespace kvasbo\tellulf;

require_once "./kok/ical.php";

class Weather
{
  public static function Get_Forecast()
  {
  	$data = file_get_contents($_ENV["YR_URL_FORECAST"], false, static::Get_Yr_Context());
  	$forecast = json_decode($data);
	  
  	// echo "<pre>".htmlentities(print_r($forecast, true))."</pre>";
  }

  public static function Get_Nowcast()
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
