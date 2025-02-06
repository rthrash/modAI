<?php
namespace modAI;

use MODX\Revolution\modX;

class RequiredSettingException extends \Exception {
    public function __construct(string $setting)
    {
        parent::__construct("System setting `$setting` is required.");
    }
}

class Settings {
    /**
     * @throws RequiredSettingException
     */
    public static function getPromptSetting(modX $modx, string $field, string $setting, string $model = null): string {
        $value = $modx->getOption("modai.prompt.$field.$setting", null, $modx->getOption("modai.global.$setting"), true);

        if (empty($value)) {
            throw new RequiredSettingException("modai.global.$setting");
        }

        return $value;
    }

    public static function getPrompt(modX $modx, string $prompt, string $model = null): string {
        return $modx->getOption("modai.prompt.$prompt");
    }
}
