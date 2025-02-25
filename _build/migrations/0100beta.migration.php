<?php

return new class() {
    // migration runs if self::VERSION > currently installed version
    const VERSION = '0.10.0-beta';

    /**
    * @var \MODX\Revolution\modX
    */
    private $modx;

    private $systemSettingsMap = [
        'modai.global.base.output' => 'modai.global.text.base_output',
        'modai.global.base.prompt' => 'modai.global.text.base_prompt',
        'modai.global.max_tokens' => 'modai.global.text.max_tokens',
        'modai.global.model' => 'modai.global.text.model',
        'modai.global.temperature' => 'modai.global.text.temperature',

        'modai.res.pagetitle.prompt' => 'modai.res.pagetitle.text.prompt',
        'modai.res.longtitle.prompt' => 'modai.res.longtitle.text.prompt',
        'modai.res.introtext.prompt' => 'modai.res.introtext.text.prompt',
        'modai.res.description.prompt' => 'modai.res.description.text.prompt',

        'modai.vision.model' => 'modai.global.vision.model',
        'modai.vision.prompt' => 'modai.global.vision.prompt',

        'modai.image.model' => 'modai.global.image.model',
        'modai.image.size' => 'modai.global.image.size',
        'modai.image.quality' => 'modai.global.image.quality',
        'modai.image.path' => 'modai.global.image.path',
        'modai.image.download_domains' => 'modai.global.image.download_domains',
    ];

    /**
     * @param \MODX\Revolution\modX $modx
     * @return void
     */
    public function __invoke(&$modx)
    {
        $this->modx =& $modx;

        foreach ($this->systemSettingsMap as $oldKey => $newKey) {
            $oldSetting = $this->modx->getObject(\MODX\Revolution\modSystemSetting::class, ['key' => $oldKey, 'namespace' => 'modai']);
            if (!$oldSetting) {
                continue;
            }

            $newSetting = $this->modx->getObject(\MODX\Revolution\modSystemSetting::class, ['key' => $newKey, 'namespace' => 'modai']);
            if (!$newSetting) {
                continue;
            }

            $newSetting->set('value', $oldSetting->get('value'));
            $newSetting->save();
            $oldSetting->remove();
        }
    }
};
