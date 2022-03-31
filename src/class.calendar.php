<?php

namespace kvasbo\tellulf;

use ICal\ICal as ICal;

class Calendar
{

    private $events;
    private $birthdays;
    private $parser;
    private $parser_settings = array(
      'defaultSpan'                 => 2,     // Default value
      'defaultTimeZone'             => 'UTC',
      'defaultWeekStart'            => 'MO',  // Default value
      'disableCharacterReplacement' => false, // Default value
      'filterDaysAfter'             => 7,  // Default value
      'filterDaysBefore'            => 1,  // Default value
      'skipRecurrence'              => false, // Default value
    );

    public function __construct()
    { 
        $this->parser = new Ical(false, $this->parser_settings);
        $this->events = $this->Fetch($_ENV["CAL_FELLES"]);
        $this->birthdays = $this->Fetch($_ENV["CAL_BIRTHDAYS"]);
    }

    public function Get_Events(string $date)
    {
        
        $events = $this->events->eventsFromRange($date, $date);

        // print_r($events);

        $out = [];

        foreach ($events as $e) {

          // Full day
          $fullDay = false;

          print_r($e);
          // echo $e->dtstart_tc;

          $start = substr($e->dtstart_tz, 9, 2) . ":" . substr($e->dtstart_tz, 11, 2);
           
           /* if (date("H", $start) === "00" && $e->duration() % 86400 === 0) {
                $fullDay = true;
            }*/

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

        return $out;

        if (empty($this->birthdays[$date])) {
            return $out;
        }

        foreach ($this->birthdays[$date] as $e) {

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