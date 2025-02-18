<?php
namespace modAI\Processors\Prompt;

use modAI\RequiredSettingException;
use modAI\Services\ChatGPT;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class FreeText extends Processor
{
    public function process()
    {
        $prompt = $this->getProperty('prompt');

        if (empty($prompt)) {
            return $this->failure('Prompt is required.');
        }

        $chatGPT = new ChatGPT($this->modx);


        $messages = [];

        $model = Settings::getSetting($this->modx, 'global.model');
        $temperature = (float)Settings::getSetting($this->modx, 'global.temperature', $model);
        $maxTokens = (int)Settings::getSetting($this->modx, 'global.max_tokens', $model);

        $output = Settings::getSetting($this->modx, 'global.base.output');
        if (!empty($output)) {
            $messages[] = [
                'role' => 'system',
                'content' => $output,
            ];
        }

        $base = Settings::getPrompt($this->modx, 'global.base');
        if (!empty($base)) {
            $messages[] = [
                'role' => 'system',
                'content' => $base,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        $data = [
            'model' => $model,
            'messages' => $messages,
            'max_tokens' => $maxTokens,
            'temperature' => $temperature
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
