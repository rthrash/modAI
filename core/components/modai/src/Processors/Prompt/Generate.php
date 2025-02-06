<?php
namespace modAI\Processors\Prompt;

use modAI\RequiredSettingException;
use modAI\Services\ChatGPT;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class Generate extends Processor
{
    private static array $validFields = ['pagetitle', 'longtitle', 'introtext', 'description'];

    public function process()
    {
        $fields = array_flip(self::$validFields);
        $field = $this->getProperty('field');

        if (!isset($fields[$field])) {
            return $this->failure('Unsupported field.');
        }

        $id = $this->getProperty('id');
        if (empty($id)) {
            return $this->failure('No resource specified.');
        }

        $resource = $this->modx->getObject('modResource', $id);
        if (!$resource) {
            return $this->failure('Resource not found.');
        }

        $content = $resource->getContent();
        if (empty($content)) {
            return $this->failure('There\'s no content');
        }

        $chatGPT = new ChatGPT($this->modx);


        $messages = [];

        try {
            $model = Settings::getPromptSetting($this->modx, $field, 'model');
            $temperature = (float)Settings::getPromptSetting($this->modx, $field, 'temperature', $model);
            $maxTokens = (int)Settings::getPromptSetting($this->modx, $field, 'max_tokens', $model);
        } catch (RequiredSettingException $e) {
            return $this->failure($e->getMessage());
        }

        $base = Settings::getPrompt($this->modx, 'base');
        if (!empty($base)) {
            $messages[] = [
                'role' => 'system',
                'content' => $base,
            ];
        }

        $fieldPrompt = Settings::getPrompt($this->modx, $field);
        if (!empty($fieldPrompt)) {
            $messages[] = [
                'role' => 'system',
                'content' => $fieldPrompt,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $content
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
