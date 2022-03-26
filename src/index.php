<?php
/**
 *  Tellulf main file
 *  Slim Framework: https://www.slimframework.com/docs/v4/
 *  Twig Framework: https://twig.symfony.com
 */

namespace kvasbo\tellulf;

define("HOMEY_FILE", "./homey.json");

 // Auto loader
require __DIR__ . "/vendor/autoload.php";

use \Psr\Http\Message\ResponseInterface as Response;
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Slim\Factory\AppFactory;

// Set the thingy
date_default_timezone_set('Europe/Oslo');

// Create Slim factory
$app = AppFactory::create();
$app->addRoutingMiddleware();
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

require_once "./class.tellulf.php";
require_once "./class.clock.php";
require_once "./class.homey.php";

// Load Twig
$twig_loader = new \Twig\Loader\FilesystemLoader("./templates");
$twig = new \Twig\Environment($twig_loader, [
    "cache" => false, //"./twig-cache",
]);

// Main user interface
$app->get('/', function (Request $request, Response $response, $args) {

  global $twig;
  $tellulf = new Tellulf();

  $coming_days = $tellulf->Generate_Coming_Days();
  $today = $tellulf->Generate_Today();

  $weather = $tellulf->weather->Get_Current_Weather();
  $hourly = $tellulf->weather->Get_Hourly_Forecasts();

  $homey = Homey::Get_Latest_Data();
  
  $current_temp = $weather['temperature'];

  if(!empty($homey->tempOut) && !empty($homey->age) && $homey->age < 100) {
    $current_temp = $homey->tempOut;
  }

  $render_vars = [
      "current_temperature" => $current_temp,
      "current_weather_icon" => $weather['symbol'],
      "days" => $coming_days,
      "today" => $today,
      "hourly_weather" => $hourly,
  ];

  $template_index = $twig->load("index.html");
  $page = $template_index->render($render_vars);
  $response->getBody()->write($page);
  return $response;
  
});

// Clock
$app->get("/time", function (Request $request, Response $response, $args) {
  $data = array('time' => Clock::getTime(), 'date' => Clock::getDateFormatted(), 'week' => Clock::getWeek());
  $payload = json_encode($data);
  $response->getBody()->write($payload);
  return $response->withHeader('Content-Type', 'application/json');
});

// Tibber
$app->get("/tibber", function (Request $request, Response $response, $args) {
  require_once "./class.power.php";
  $power = Power::Get_Consumption();
  $data = array(
      'cabin' => array(
        'usageToday' => $power['hytta']['used'],
        'costToday' => $power['hytta']['cost']
        ),
      'home' => array(
        'usageToday' => $power['hjemme']['used'],
        'costToday' => $power['hjemme']['cost']
      )
    );
  $payload = json_encode($data);
  $response->getBody()->write($payload);
  return $response->withHeader('Content-Type', 'application/json');
});

// Receive data from Homey
$app->get("/homey", function (Request $request, Response $response, $args) {
  $payload = Homey::Get_Latest_Data();
  $response->getBody()->write(json_encode($payload));
  return $response->withHeader('Content-Type', 'application/json');
});

// Receive data from Homey
$app->get("/homey_put", function (Request $request, Response $response, $args) {
  $params = $request->getQueryParams();
  $params['time'] = time();
  $toStore = json_encode($params);
  file_put_contents(HOMEY_FILE, $toStore);
  $response->getBody()->write($toStore);
  return $response;
});



// Run app
$app->run();