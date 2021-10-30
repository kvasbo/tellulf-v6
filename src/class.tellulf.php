<?php
/**
*	The main command structure
*/

namespace kvasbo\tellulf;

require_once "./class.calendar.php";
require_once "./class.weather.php";

class Tellulf
{
	private $weather;
	private $calendar;
	
	public function __construct() {
		$this->weather = new Weather();
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
			$date = $datetime->format('Y-m-d');
			
			// Build return array
			$days[] = array(
				'date' => $datetime->format('d.m.Y'),
				'forecast' => $this->weather->forecast[$date],
			);
		}
		return $days;
	}
	
	public function Get_Nowcast() {
		return $this->weather->nowcast;
	}
	
}