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
        set_time_limit(0);

        $field = $this->getProperty('fieldName');

        $image = $this->getProperty('image');
        if (empty($image)) {
            return $this->failure('Image is required');
        }

        try {
            $model = Settings::getVisionFieldSetting($this->modx, $field, 'model');
            $prompt = Settings::getVisionFieldSetting($this->modx, $field, 'prompt');

            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->getVision($prompt, $image, VisionConfig::new($model));

            return $this->success('', $result->toArray());
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
