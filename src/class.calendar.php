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
            if (date("H", $start) === "00" && $e->duration() % 86400 === 0) {
                $startDisplay = "";
            } else {
                $startDisplay = date("H:i", $start);
            }

            $tmp = array(
                'time' => $startDisplay,
                'title' => $title = $e->summary,
            );
            $out[] = $tmp;
        }

        return $out;
    }

    public function Get_Birthdays(string $date)
    {
        if (empty($this->birthdays[$date])) {
            return [];
        }

        $events = $this->birthdays[$date];

        return $events;
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