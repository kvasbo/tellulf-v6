<?php

namespace kvasbo\tellulf;

class Clock {

  public static function getTime($time = null) {
    if (is_null(($time))) $time = time();
    return date("H:i", $time);
  }

  public static function getDateFormatted() {
    $day = static::getDayName((int) date('w'));
    $month = static::getMonthName((int) date('n') - 1);
    $date = date("j");
    return "$day $date.";
  }

  public static function getDayName(int $day) {
    $days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    return $days[$day];
  }

  public static function getMonthName(int $month) {
    $months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
    return $months[$month];
  }

}