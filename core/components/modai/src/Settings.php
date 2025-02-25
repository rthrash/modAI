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
    private static function getOption(modX $modx, string $namespace, string $field, string $area, string $setting)
    {
        if (!empty($field)) {
            $value = $modx->getOption("$namespace.$field.$area.$setting");
            if (!empty($value)) {
                return $value;
            }
        }

        $value = $modx->getOption("$namespace.global.$area.$setting");
        if (!empty($value)) {
            return $value;
        }

        if ($namespace === 'modai') {
            return null;
        }

        if (!empty($field)) {
            $value = $modx->getOption("modai.$field.$area.$setting");
            if (!empty($value)) {
                return $value;
            }
        }

        $value = $modx->getOption("modai.global.$area.$setting");
        if (!empty($value)) {
            return $value;
        }

        return null;
    }

    /**
     * @throws RequiredSettingException
     */
    public static function getTextSetting(modX $modx, string $field, string $setting, string $namespace = 'modai', bool $required = true): string
    {
        $value = self::getOption($modx, $namespace, $field, 'text', $setting);

        if ($required && empty($value)) {
            throw new RequiredSettingException("modai.global.text.$setting");
        }

        return $value;
    }

    /**
     * @throws RequiredSettingException
     */
    public static function getImageSetting(modX $modx, string $field, string $setting, string $namespace = 'modai', bool $required = true): string
    {
        $value = self::getOption($modx, $namespace, $field, 'image', $setting);

        if ($required && empty($value)) {
            throw new RequiredSettingException("modai.global.image.$setting");
        }

        return $value;
    }

    /**
     * @throws RequiredSettingException
     */
    public static function getVisionSetting(modX $modx, string $field, string $setting, string $namespace = 'modai', bool $required = true): string
    {
        $value = self::getOption($modx, $namespace, $field, 'vision', $setting);

        if ($required && empty($value)) {
            throw new RequiredSettingException("modai.global.vision.$setting");
        }

        return $value;
    }

    public static function getSetting(modX $modx, string $key, string $default = null) {
        return $modx->getOption("modai.$key", null, $default);
    }

    public static function getApiSetting(modX $modx, string $service, string $key) {
        return $modx->getOption("modai.api.$service.$key", null, $modx->getOption("modai.api.$key"));
    }
}
