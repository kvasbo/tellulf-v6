<?php
/**
 *	Tellulf main file
 */

// Auto loader
require_once "./vendor/autoload.php";

// Load Twig
$twig_loader = new \Twig\Loader\FilesystemLoader("./templates");

$twig = new \Twig\Environment($twig_loader, [
  "cache" => "./twig-cache",
]);

$template_index = $twig->load("index.html");
$template_index->display();
