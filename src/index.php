<?php
/**
 *    Tellulf main file
 */

namespace kvasbo\tellulf;

date_default_timezone_set('Europe/Oslo');

// Auto loader
require __DIR__ . "/vendor/autoload.php";

require_once "./class.tellulf.php";

// Load Twig
$twig_loader = new \Twig\Loader\FilesystemLoader("./templates");
$twig = new \Twig\Environment($twig_loader, [
    "cache" => false, //"./twig-cache",
]);

$tellulf = new Tellulf();

$coming_days = $tellulf->Generate_Coming_Days();
$today = $tellulf->Generate_Today();

$nowcast = $tellulf->Get_Nowcast();

$render_vars = [
    "current_temperature" => $nowcast['temperature'],
    "current_weather_icon" => $nowcast['symbol'],
    "days" => $coming_days,
    "today" => $today,
];

$template_index = $twig->load("index.html");
$template_index->display($render_vars);