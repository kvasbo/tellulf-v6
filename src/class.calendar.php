<?php

namespace kvasbo\tellulf;

// https://github.com/u01jmg3/ics-parser
use ICal\ICal as ICal;

class Calendar
{

    private $events;
    private $birthdays;
    private $parser_settings = array(
      'defaultTimeZone'             => 'UTC',
      'filterDaysAfter'             => 7,
      'filterDaysBefore'            => 1,
    );

    public function __construct()
    { 
        $this->events = $this->Fetch($_ENV["CAL_FELLES"]);
        $this->birthdays = $this->Fetch($_ENV["CAL_BIRTHDAYS"]);
    }

    public function Get_Events(string $date)
    {
        
        $events = $this->events->eventsFromRange($date, $date);

        $out = [];

        foreach ($events as $e) {

          $duration = $e->dtend_array[2] - $e->dtstart_array[2];
          $startHour = substr($e->dtstart_tz, 9, 2);

          $start = substr($e->dtstart_tz, 9, 2) . ":" . substr($e->dtstart_tz, 11, 2);

          // Full day detection
          $fullDay = false;
          if ( $duration % 86400 == 0 && ($startHour == "00" || $startHour == "01" || $startHour == "02") ) {
            $fullDay = true;
          }

          // Handle events that starts before the date

          $tmp = array(
              'time' => $start,
              'title' => $e->summary,
              'fullDay' => $fullDay,
          );
          $out[] = $tmp;
            
        }

        return $out;
    }

    public function Get_Birthdays(string $date)
    {
        $out = [];

        $events = $this->birthdays->eventsFromRange($date, $date);

        if (empty($events)) {
            return $out;
        }

        foreach ($events as $e) {

            // Look for year
            $b = $e->summary;
            $exp = explode(" ", $b);

            if (is_numeric(($exp[count($exp) - 1]))) {
                $age = date("Y") - $exp[count($exp) - 1];
                array_pop($exp);
                $out[] = join(" ", $exp) . " " . $age;
            } else {
                $out[] = $e->summary;
            }

        }

        return $out;
    }

    /**
     *    Fetch the Ics and return a parser.
     */
    public function Fetch($calendar_url)
    {
        $ical = new ICal(false, $this->parser_settings);

        $ical->initUrl($calendar_url, null, null, );

        return $ical;
    }
}