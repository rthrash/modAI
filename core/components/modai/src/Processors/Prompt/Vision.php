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

        $field = $this->getProperty('field');
        $namespace = $this->getProperty('namespace', 'modai');
        $image = $this->getProperty('image');

        if (empty($image)) {
            return $this->failure($this->modx->lexicon('modai.error.image_requried'));
        }

        try {
            $model = Settings::getVisionSetting($this->modx, $field, 'model', $namespace);
            $prompt = Settings::getVisionSetting($this->modx, $field, 'prompt', $namespace);

            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->getVision($prompt, $image, VisionConfig::new($model));

            return $this->success('', $result->generate());
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
