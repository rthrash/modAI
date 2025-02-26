<?php

namespace modAI\Processors\Prompt;

use modAI\Exceptions\LexiconException;
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
        $field = $this->getProperty('field', '');
        $namespace = $this->getProperty('namespace', 'modai');

        if (empty($prompt)) {
            return $this->failure($this->modx->lexicon('modai.error.prompt_required'));
        }

        try {
            $model = Settings::getImageSetting($this->modx, $field, 'model', $namespace);
            $size = Settings::getImageSetting($this->modx, $field, 'size', $namespace);
            $quality = Settings::getImageSetting($this->modx, $field, 'quality', $namespace);

            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->generateImage($prompt, ImageConfig::new($model)->size($size)->quality($quality));

            return $this->success('', $result->generate());
        } catch(LexiconException $e) {
            return $this->failure($this->modx->lexicon($e->getLexicon(), $e->getLexiconParams()));
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

    public function getLanguageTopics() {
        return ['modai:default'];
    }

}
