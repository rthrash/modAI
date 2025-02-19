<?php

namespace modAI\Processors\Prompt;

use modAI\Services\AIServiceFactory;
use modAI\Services\Config\ImageConfig;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class Image extends Processor
{
    public function process()
    {
        set_time_limit(0);

        $prompt = $this->getProperty('prompt');
        $field = $this->getProperty('fieldName', '');

        if (empty($prompt)) {
            return $this->failure('Prompt is required');
        }

        try {
            $model = Settings::getImageFieldSetting($this->modx, $field, 'model');
            $size = Settings::getImageFieldSetting($this->modx, $field, 'size');
            $quality = Settings::getImageFieldSetting($this->modx, $field, 'quality');
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }

        try {
            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->generateImage($prompt, ImageConfig::new($model)->size($size)->quality($quality));

            return $this->success('', $result);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
