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
        $field = $this->getProperty('field');

        if (empty($prompt)) {
            return $this->failure('Prompt is required.');
        }

        $chatGPT = new ChatGPT($this->modx);

        $messages = [];

        try {
            $model = Settings::getFieldSetting($this->modx, $field, 'model');
            $temperature = (float)Settings::getFieldSetting($this->modx, $field, 'temperature');
            $maxTokens = (int)Settings::getFieldSetting($this->modx, $field, 'max_tokens');
            $output = Settings::getFieldSetting($this->modx, $field, 'base.output', false);
        } catch (RequiredSettingException $e) {
            return $this->failure($e->getMessage());
        }

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
