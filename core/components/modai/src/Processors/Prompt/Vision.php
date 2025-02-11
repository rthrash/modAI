<?php
namespace modAI\Processors\Prompt;

use modAI\Services\ChatGPT;
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

        $chatGPT = new ChatGPT($this->modx);

        $model = Settings::getSetting($this->modx, 'vision.model');
        if (empty($model)) {
            return $this->failure('vision.model setting is required');
        }

        $prompt = Settings::getSetting($this->modx, 'vision.prompt');
        if (empty($prompt)) {
            return $this->failure('vision.prompt setting is required');
        }

        $messages = [];

        $messages[] = [
            'role' => 'user',
            'content' => [
                [
                    "type"=> "text",
                    "text"=> $prompt,
                ],
                [
                    "type" => "image_url",
                    "image_url" => ["url" => $image],
                ],
            ]
        ];

        $data = [
            'model' => $model,
            'messages' => $messages,
        ];

        try {
            $result = $chatGPT->getCompletions($data);

            if (!isset($result['choices'][0]['message']['content'])) {
                return $this->failure('Error from ChatGPT API: ' . print_r($result, true));
            }

            $response = trim($result['choices'][0]['message']['content']);

            return $this->success('', ['content' => $response]);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
