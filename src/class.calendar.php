<?php

namespace kvasbo\tellulf;

require_once "./kok/ical.php";

class Calendar
{
  /**
   *	Read the Ics and return an array of events.
   */
  public static function Fetch($calendar_url)
  {
    $data = file_get_contents($calendar_url);

    $iCal = new \iCal($data);
    $events = @$iCal->eventsByDateUntil("+30 days");

    /*
    foreach ($events as $date => $events) {
      echo $date . "\n";
      echo "----------" . "\n";

      foreach ($events as $event) {
        echo "* " . $event->title() . "\n";
      }

      echo "\n";
    }
    */

    return $events;
  }
}
