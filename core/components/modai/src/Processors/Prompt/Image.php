<?php

namespace modAI\Processors\Prompt;

use modAI\Services\ChatGPT;
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

        $chatGPT = new ChatGPT($this->modx);

        $data = [
            'model' => $model,
            'prompt' => $prompt,
            'n' => 1,
            'size' => $size
        ];

        try {
            $result = $chatGPT->generateImage($data);

            if (!isset($result['data'][0]['url'])) {
                return $this->failure('Error from ChatGPT API: ' . print_r($result, true));
            }

            return $this->success('', ['data' => $result['data'][0]]);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
