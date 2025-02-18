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
        $prompt = $this->getProperty('prompt');
        if (empty($prompt)) {
            return $this->failure('Prompt is required');
        }

        $model = Settings::getSetting($this->modx, 'image.model');
        if (empty($model)) {
            return $this->failure('image.model setting is required');
        }

        $size = Settings::getSetting($this->modx, 'image.size');
        if (empty($size)) {
            return $this->failure('image.size setting is required');
        }

        $quality = Settings::getSetting($this->modx, 'image.quality');
        if (empty($quality)) {
            return $this->failure('image.quality setting is required');
        }

        try {
            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->generateImage($prompt, ImageConfig::new($model)->size($size)->quality($quality));

            return $this->success('', ['url' => $result]);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
