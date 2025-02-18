<?php
namespace modAI\Processors\Prompt;

use modAI\Services\AIServiceFactory;
use modAI\Services\Config\VisionConfig;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class Vision extends Processor
{
    public function process()
    {
        $image = $this->getProperty('image');
        if (empty($image)) {
            return $this->failure('Image is required');
        }

        $model = Settings::getSetting($this->modx, 'vision.model');
        if (empty($model)) {
            return $this->failure('vision.model setting is required');
        }

        $prompt = Settings::getSetting($this->modx, 'vision.prompt');
        if (empty($prompt)) {
            return $this->failure('vision.prompt setting is required');
        }

        try {
            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->getVision($prompt, $image, VisionConfig::new($model));

            return $this->success('', ['content' => $result]);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
