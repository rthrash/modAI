<?php
/**
 * @var \MODX\Revolution\modX $modx
 */

if ($modx->event->name !== 'OnManagerPageBeforeRender') {
    return;
}

if (!$modx->services->has('modai')) return;

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
                    modAI.tvs =  ' . $modx->toJSON($modAI->getListOfTVsWithIDs()) . ';
                    modAI.resourceFields =  ' . $modx->toJSON($modAI->getResourceFields()) . ';
                });
            </script>
        ');

    $modx->regClientCSS($assetsUrl . 'css/mgr.css');
    $modx->regClientStartupScript($assetsUrl . 'js/mgr/modai.js');
    $modx->regClientStartupScript($assetsUrl . 'js/mgr/history.js');
    $modx->regClientStartupScript($assetsUrl . 'js/mgr/executor.js');
    $modx->regClientStartupScript($assetsUrl . 'js/mgr/autosummary.js');
    $modx->regClientStartupScript($assetsUrl . 'js/mgr/widgets/image_prompt.window.js');
    $modx->regClientStartupScript($assetsUrl . 'js/mgr/widgets/text_prompt.window.js');
}
