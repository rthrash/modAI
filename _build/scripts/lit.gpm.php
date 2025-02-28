<?php

use MODX\Revolution\modSystemSetting;

return new class() {
    /**
     * @var \MODX\Revolution\modX
     */
    private $modx;

    /**
     * @var int
     */
    private $action;

    /**
    * @param \MODX\Revolution\modX $modx
    * @param int $action
    * @return bool
    */
    public function __invoke(&$modx, $action)
    {
        $this->modx =& $modx;
        $this->action = $action;

        if ($this->action === \xPDO\Transport\xPDOTransport::ACTION_UNINSTALL) return true;

        $setting = $this->modx->getObject(modSystemSetting::class, ['key' => 'modai.cache.lit', 'namespace' => 'modai']);
        if (!$setting) {
            $setting = $this->modx->newObject(modSystemSetting::class);
            $setting->set('key', 'modai.cache.lit');
            $setting->set('namespace', 'modai');
            $setting->set('xtype', 'textfield');
            $setting->set('area', 'cache');
            $setting->set('editedon', time());
            $setting->set('editedby', 0);
        }

        $setting->set('value', time());
        $setting->save();

        return true;
    }
};
