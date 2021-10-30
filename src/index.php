<?php
/**
 *	Tellulf main file
 */

namespace kvasbo\tellulf;

// Auto loader
require __DIR__ . "/vendor/autoload.php";

require_once "./class.calendar.php";
require_once "./class.weather.php";

// Load Twig
$twig_loader = new \Twig\Loader\FilesystemLoader("./templates");
$twig = new \Twig\Environment($twig_loader, [
  "cache" => false, //"./twig-cache",
]);

Calendar::Fetch($_ENV["CAL_FELLES"]);
Weather::Get_Forecast();
Weather::Get_Nowcast();
  
$render_vars = [
  "date" => "hei",
];

$template_index = $twig->load("index.html");
$template_index->display($render_vars);
