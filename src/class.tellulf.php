<?php
/**
 *    The main command structure
 */

namespace kvasbo\tellulf;

require_once "./class.calendar.php";
require_once "./class.weather.php";

class Tellulf
{
    public $weather;
    private $calendar;

    public function __construct()
    {
        $this->weather = new Weather();
        $this->calendar = new Calendar();

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
        return $days;
    }

    public function Generate_Today()
    {
        $data = $this->Get_Data_For_Date(new \DateTime("today"));

        // only stuff that happens later.
        $data['detail_forecast'] = array_filter(
            $data['detail_forecast'], function ($k) {
                $now = date("H");
                return $k > $now;
            },
            ARRAY_FILTER_USE_KEY
        );

        return $data;
    }

    /**
     * Get_Data_For_Date
     *
     * @param  mixed $datetime
     * @return array
     */
    private function Get_Data_For_Date(\Datetime $datetime)
    {
        $date = $datetime->format('Y-m-d');

        $forecast = $this->weather->Get_Six_Hour_Forecasts();

        $weather_details = $this->weather->Get_Detailed_Weather();
        $sun = \date_sun_info(time(), 59.9508301, 10.685248);

        return array(
            'date' => static::Create_Nice_Date($datetime),
            'forecast' => !empty($forecast[$date]) ? $forecast[$date] : [],
            'events' => $this->calendar->Get_Events($date),
            'birthdays' => $this->calendar->Get_Birthdays($date),
            'detail_forecast' => !empty($weather_details[$date]) ? $weather_details[$date] : [],
            'sunrise' => Clock::getTime($sun['sunrise']),
            'sunset' => Clock::getTime($sun['sunset']),
        );
    }

    /**
     * Create_Nice_Date
     *
     * @param  mixed $datetime
     * @return void
     */
    private static function Create_Nice_Date(\Datetime $datetime)
    {
        $dager = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
        $weekday = $datetime->format("w");
        return $dager[$weekday] . " " . $datetime->format('j.');
    }

}