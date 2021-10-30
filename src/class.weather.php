<?php

namespace kvasbo\tellulf;

require_once "./kok/ical.php";

class Weather
{
  public static function Get_Forecast()
  {
  	$data = file_get_contents($_ENV["YR_URL_FORECAST"], false, static::Get_Yr_Context());
  }

  public static function Get_Nowcast()
  {
  	$data = file_get_contents($_ENV["YR_URL_NOWCAST"], false, static::Get_Yr_Context());
  }
  
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
