<?php
/**
*	The main command structure
*/

namespace kvasbo\tellulf;

require_once "./class.calendar.php";
require_once "./class.weather.php";

class Tellulf
{
	private $forecast;
	private $nowcast;
	private $calendar;
	
	public function __construct() {
		$this->forecast = Weather::Get_Forecast();
		$this->nowcast = Weather::Get_Nowcast();
		$this->events = Calendar::Fetch($_ENV["CAL_FELLES"]);
	}
	
	/** 
	*	Generate N days ahead
	*/
	public function Generate_Coming_Days() {
		$days = [];
		for ($i = 1; $i <= 5; $i++) {
			// Create date 
			$datetime = new \DateTime("today + $i days");
			
			// Build return array
			$days[] = array(
				'date' => $datetime->format('d.m.Y'),
			);
		}
		return $days;
	}
	
	public function Get_Nowcast() {
		return $this->nowcast;
	}
	
}