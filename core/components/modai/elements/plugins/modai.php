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
    $assetsUrl = $modAI->getOption('assetsUrl');
    $modx->controller->addLexiconTopic('modai:default');

    $modx->controller->addHtml('
            <script type="text/javascript">
                Ext.onReady(function() {
                    modAI.config = ' . $modx->toJSON($modAI->config) . ';
                    modAI.apiURL = "' . $modAI->getAPIUrl() . '";
                    modAI.tvs =  ' . $modx->toJSON($modAI->getListOfTVsWithIDs()) . ';
                    modAI.resourceFields =  ' . $modx->toJSON($modAI->getResourceFields()) . ';
                });
            </script>
        ');

    $lit = $modAI->getLit();

    $modx->regClientCSS("{$assetsUrl}css/mgr.css?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/modai.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/history.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/chat_history.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/ui.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/executor.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/autosummary.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/widgets/image_prompt.window.js?lit=$lit");
    $modx->regClientStartupScript("{$assetsUrl}js/mgr/widgets/text_prompt.window.js?lit=$lit");
}
