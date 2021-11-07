<?php
/**
 *    The main command structure
 */

namespace kvasbo\tellulf;

require_once "./class.calendar.php";
require_once "./class.weather.php";
require_once "./class.s3.php";

class Tellulf
{
    public $weather;
    private $events;
    private $birthdays;
    private $s3;

    public function __construct()
    {
        $this->weather = new Weather();
        $this->events = Calendar::Fetch($_ENV["CAL_FELLES"]);
        $this->birthdays = Calendar::Fetch($_ENV["CAL_BIRTHDAYS"]);
        $this->s3 = new s3();
    }

    /**
     *    Generate N days ahead
     */
    public function Generate_Coming_Days(int $number_of_days = 4)
    {
        $days = [];
        for ($i = 1; $i <= $number_of_days; $i++) {
            // Build return array
            $days[] = $this->Get_Data_For_Date(new \DateTime("today + $i days"));
        }
        $this->s3->Store_Array("today.json", $days);
        return $days;
    }

    public function Generate_Today()
    {
        $data = $this->Get_Data_For_Date(new \DateTime("today"));
        $now = date("H");

        $data['detail_forecast'] = array_filter(
            $data['detail_forecast'], function ($k) {
                $now = date("H");
                return $k > $now;
            },
            ARRAY_FILTER_USE_KEY
        );

        return $data;
    }

    private function Get_Data_For_Date(\Datetime $datetime)
    {
        $date = $datetime->format('Y-m-d');
        $forecast = $this->weather->Get_Six_Hour_Forecasts();
        $weather_details = $this->weather->Get_Detailed_Weather();

        return array(
            'date' => static::Create_Nice_Date($datetime),
            'forecast' => !empty($forecast[$date]) ? $forecast[$date] : [],
            'events' => !empty($this->events[$date]) ? $this->events[$date] : [],
            'birthdays' => !empty($this->birthdays[$date]) ? $this->birthdays[$date] : [],
            'detail_forecast' => !empty($weather_details[$date]) ? $weather_details[$date] : [],
        );
    }

    private static function Create_Nice_Date(\Datetime $datetime)
    {

        $dager = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
        $weekday = $datetime->format("w");
        return $dager[$weekday] . " " . $datetime->format('j.');
    }

}