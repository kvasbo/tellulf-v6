<?php
/**
 *  Tellulf main file
 *  Slim Framework: https://www.slimframework.com/docs/v4/
 *  Twig Framework: https://twig.symfony.com
 */

namespace kvasbo\tellulf;

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

// Load Twig
$twig_loader = new \Twig\Loader\FilesystemLoader("./templates");
$twig = new \Twig\Environment($twig_loader, [
    "cache" => false, //"./twig-cache",
]);

$app->get('/', function (Request $request, Response $response, $args) {

  global $twig;
  $tellulf = new Tellulf();

  $coming_days = $tellulf->Generate_Coming_Days();
  $today = $tellulf->Generate_Today();

  $weather = $tellulf->weather->Get_Current_Weather();

  $render_vars = [
      "current_temperature" => $weather['temperature'],
      "current_weather_icon" => $weather['symbol'],
      "days" => $coming_days,
      "today" => $today,
  ];

  $template_index = $twig->load("index.html");
  $page = $template_index->render($render_vars);
  $response->getBody()->write($page);
  return $response;
  
});

// Run app
$app->run();