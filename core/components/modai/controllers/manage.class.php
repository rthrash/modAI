<?php
require_once dirname(dirname(__FILE__)) . '/index.class.php';

class modAIManageManagerController extends modAIBaseManagerController
{

    public function process(array $scriptProperties = []): void
    {
    }

    public function getPageTitle(): string
    {
        return $this->modx->lexicon('modgpt');
    }

    public function loadCustomCssJs(): void
    {
        $this->addLastJavascript($this->modgpt->getOption('jsUrl') . 'mgr/widgets/manage.panel.js');
        $this->addLastJavascript($this->modgpt->getOption('jsUrl') . 'mgr/sections/manage.js');

        $this->addHtml(
            '
            <script type="text/javascript">
                Ext.onReady(function() {
                    MODx.load({ xtype: "modgpt-page-manage"});
                });
            </script>
        '
        );
    }

    public function getTemplateFile(): string
    {
        return $this->modgpt->getOption('templatesPath') . 'manage.tpl';
    }

}
