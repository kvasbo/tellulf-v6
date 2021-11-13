<?php

namespace kvasbo\tellulf;

require_once "./kok/ical.php";

class Weather
{

    public $forecast = [];
    public $nowcast = [];

    /**
     * __construct
     *
     * @return void
     */
    public function __construct()
    {
        $this->forecast = static::Fetch_Forecast();
        $this->nowcast = static::Fetch_Nowcast();
    }

    public function Get_Current_Weather(): array
    {

        return array(
            'temperature' => $this->nowcast[0]->data->instant->details->air_temperature,
            'symbol' => $this->nowcast[0]->data->next_1_hours->summary->symbol_code,
        );

    }

    public function Get_Detailed_Weather()
    {
        $return = [];
        foreach ($this->forecast as $series) {

            if (count($return) >= 18) {
                break;
            }
            $time = strtotime($series->time);
            $date = date("Y-m-d", $time);
            $date_data = \date_parse(date("Y-m-d H:i:s", $time));
            if (!empty($series->data->next_1_hours->details)) {

                // Init array
                if (empty($return[$date])) {
                    $return[$date] = [];
                }

                // Build return data set
                $return[$date][$date_data['hour']] = array(
                    "symbol" => $series->data->next_1_hours->summary->symbol_code,
                    "details" => $series->data->next_1_hours->details,
                    "instant" => $series->data->instant->details,
                    "hour" => $date_data['hour'],
                );
            }
        }
        return $return;
    }

    public function Get_Six_Hour_Forecasts()
    {
        $return = [];
        foreach ($this->forecast as $series) {

            // Parse the time and handle time zones
            $time = strtotime($series->time);
            $date = date("Y-m-d", $time);
            $date_data = \date_parse(date("Y-m-d H:i:s", $time));

            if ($date_data['hour'] % 6 === 1 && !empty($series->data->next_6_hours->details)) {

                // Init array
                if (empty($return[$date])) {
                    $return[$date] = [];
                }

                // Build return data set
                $return[$date][$date_data['hour']] = array(
                    "symbol" => $series->data->next_6_hours->summary->symbol_code,
                    "details" => $series->data->next_6_hours->details,
                    "hour" => $date_data['hour'],
                );
            }
        }
        return $return;
    }

    /**
     * Fetch_Forecast
     *
     * @return void
     */
    private static function Fetch_Forecast()
    {
        // Fetch and decode JSON
        $data = file_get_contents($_ENV["YR_URL_FORECAST"], false, static::Get_Yr_Context());
        $forecast = json_decode($data);

        return $forecast->properties->timeseries;

    }

    /**
     * Fetch_Nowcast
     *
     * @return void
     */
    private static function Fetch_Nowcast()
    {
        $data = file_get_contents($_ENV["YR_URL_NOWCAST"], false, static::Get_Yr_Context());
        $nowcast = json_decode($data);

        return $nowcast->properties->timeseries;
    }

    /**
     * Generate a context to make met.no happy
     *
     * @return stream_context
     */
    private static function Get_Yr_Context()
    {
        // Create a stream
        $opts = [
            "http" => [
                "method" => "GET",
                'user_agent' => "tellulf v6: audun@kvasbo.no",
            ],
        ];

        // DOCS: https://www.php.net/manual/en/function.stream-context-create.php
        $context = stream_context_create($opts);

        return $context;
    }

}