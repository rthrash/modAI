<?php
/**
 * @var \MODX\Revolution\modX $modx
 * @var array $namespace
 */

require_once $namespace['path'] . 'vendor/autoload.php';

if (!$modx->services->has('modai')) {
    $modx->services->add('modai', function($c) use ($modx) {
        return new \modAI\modAI($modx);
    });

}
