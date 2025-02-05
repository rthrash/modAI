<?php
abstract class modAIBaseManagerController extends modExtraManagerController {
    /** @var \modAI\modAI $modAI */
    public $modgpt;

    public function initialize(): void
    {
        $this->modAI = $this->modx->services->get('modai');

        $this->addCss($this->modAI->getOption('cssUrl') . 'mgr.css');
        $this->addJavascript($this->modAI->getOption('jsUrl') . 'mgr/modai.js');

        $this->addHtml('
            <script type="text/javascript">
                Ext.onReady(function() {
                    modgpt.config = '.$this->modx->toJSON($this->modAI->config).';
                });
            </script>
        ');

        parent::initialize();
    }

    public function getLanguageTopics(): array
    {
        return array('modai:default');
    }

    public function checkPermissions(): bool
    {
        return true;
    }
}
