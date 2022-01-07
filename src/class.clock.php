<?php

namespace kvasbo\tellulf;

class Clock {

  public static function getTime() {
    return date("G:i");
  }

  public static function getDateFormatted() {
    $day = static::getDayName((int) date('w'));
    $month = static::getMonthName((int) date('n'));
    $date = date("j");
    return "$day $date. $month";
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