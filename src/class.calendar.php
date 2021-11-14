<?php

namespace kvasbo\tellulf;

require_once "./kok/ical.php";

class Calendar
{

    private $events;
    private $birthdays;

    public function __construct()
    {
        $this->events = Calendar::Fetch($_ENV["CAL_FELLES"]);
        $this->birthdays = Calendar::Fetch($_ENV["CAL_BIRTHDAYS"]);
    }

    public function Get_Events(string $date)
    {

        if (empty($this->events[$date])) {
            return [];
        }

        $events = $this->events[$date];

        $out = [];

        foreach ($events as $e) {

            $start = strtotime($e->dateStart);

            // Full day
            $fullDay = false;
            if (date("H", $start) === "00" && $e->duration() % 86400 === 0) {
                $fullDay = true;
            }

            $tmp = array(
                'time' => date("H:i", $start),
                'title' => $title = $e->summary,
                'fullDay' => $fullDay,
            );
            $out[] = $tmp;
        }

        return $out;
    }

    public function Get_Birthdays(string $date)
    {
        $out = [];

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
     *    Read the Ics and return an array of events.
     */
    public static function Fetch($calendar_url)
    {
        $data = file_get_contents($calendar_url);

        $iCal = new \iCal($data);

        $events = @$iCal->eventsByDateUntil("+10 days");

        return $events;
    }
}