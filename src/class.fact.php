<?php

namespace kvasbo\tellulf;

class Fact {
  public static function Get_Fact(): object {

    for($i = 0; $i < 10; $i++) {
      $data = file_get_contents("http://api.fungenerators.com/fact/random", false, static::Get_Context());
      $decoded = json_decode($data);
      if (!empty($decoded->contents) && strlen($decoded->contents->fact) < 225) {
        return $decoded->contents;
      }
      sleep(1);
    }
    throw new \Error("Fucking long fucking shitlong");
  }

      /**
     * Generate a context to make met.no happy
     *
     * @return stream_context
     */
    private static function Get_Context()
    {
        // Create a stream
        $opts = [
            "http" => [
                "method" => "GET",
                'user_agent' => "tellulf v6: audun@kvasbo.no",
                'header'=> "X-Fungenerators-Api-Secret: ".$_ENV["FACTS_KEY"]
            ],
        ];

        // DOCS: https://www.php.net/manual/en/function.stream-context-create.php
        $context = stream_context_create($opts);

        return $context;
    }

}