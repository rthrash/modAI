<?php
/**
 * @var \MODX\Revolution\modX $modx
 */

if ($modx->event->name !== 'OnManagerPageBeforeRender') {
    return;
}

if (!$modx->services->has('modai')) return;

/** @var \modAI\modAI $modAI */
$modAI = $modx->services->get('modai');

$action = '';

if (isset($modx->controller) && is_object($modx->controller) && property_exists($modx->controller, 'action')) {
    $action = $modx->controller->action;
} elseif (isset($_REQUEST['a'])) {
    $action = $_REQUEST['a'];
}

if (in_array($action, ['resource/create', 'resource/update'])) {
    $modx->controller->addLexiconTopic('modai:default');

    $firstName = explode(' ', $modx->user->Profile->fullname)[0];

    $modx->controller->addHtml('
            <script type="text/javascript">
            let modAI;
            Ext.onReady(function() {
                modAI = ModAI.init({
                  name: "' . $firstName . '",
                  apiURL: "' . $modAI->getAPIUrl() . '",
                });
                
                 Ext.defer(function () {
                   modAI.initOnResource({
                      tvs:  ' . $modx->toJSON($modAI->getListOfTVsWithIDs()) . ',
                      resourceFields:  ' . $modx->toJSON($modAI->getResourceFields()) . ',
                    });
                 }, 500);
            });
            </script>
        ');


    $modx->regClientCSS($modAI->getCSSFile());
    $modx->regClientStartupScript($modAI->getJSFile());
}
