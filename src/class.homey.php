<?php

namespace kvasbo\tellulf;

class Homey {
  
  public static function Get_Latest_Data() {
    $content = @file_get_contents(HOMEY_FILE);
    if(!$content) {
      $payload =[]; // Set empty json
    } else {
      $data = json_decode($content);
      $data->age = time() - (int) $data->time; // Set age
      $payload = $data; // Just to ensure niceness
    }

    return $payload;
  }

}