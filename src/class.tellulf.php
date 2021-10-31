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
	private $events;
	private $birthdays;
	
	public function __construct() {
		$this->weather = new Weather();
		$this->events = Calendar::Fetch($_ENV["CAL_FELLES"]);
		$this->birthdays = Calendar::Fetch($_ENV["CAL_BIRTHDAYS"]);
	}
	
	/** 
	*	Generate N days ahead
	*/
	public function Generate_Coming_Days() {
		$days = [];
		for ($i = 1; $i <= 5; $i++) {
			// Build return array
			$days[] = $this->Get_Data_For_Date(new \DateTime("today + $i days"));
		}
		return $days;
	}
	
	public function Generate_Today() {
		return $this->Get_Data_For_Date(new \DateTime("today"));
	}
	
	private function Get_Data_For_Date(\Datetime $datetime) {
		$date = $datetime->format('Y-m-d');
		return array(
			'date' => $datetime->format('d.m.Y'),
			'forecast' => $this->weather->forecast[$date],
			'events' => !empty($this->events[$date]) ? $this->events[$date] : [],
			'birthdays' => !empty($this->birthdays[$date]) ? $this->birthdays[$date] : []
		);
	}
	
	public function Get_Nowcast() {
		return $this->weather->nowcast;
	}
	
}