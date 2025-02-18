<?php
namespace modAI\Processors\Prompt;

use modAI\RequiredSettingException;
use modAI\Services\ChatGPT;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class Text extends Processor
{
    private static array $validFields = ['res.pagetitle', 'res.longtitle', 'res.introtext', 'res.description'];

    public function process()
    {
        $fields = array_flip(self::$validFields);
        $field = $this->getProperty('field');

        if (substr($field, 0, 3) === 'tv.') {
            $modAi = $this->modx->services->get('modai');
            $tvs = $modAi->getListOfTVs();
            $tvs = array_flip($tvs);

            $tvName = substr($field, 3);

            if (!isset($tvs[$tvName])) {
                return $this->failure('Unsupported TV.');
            }
        } else {
            if (!isset($fields[$field])) {
                return $this->failure('Unsupported field.');
            }
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
            $model = Settings::getFieldSetting($this->modx, $field, 'model');
            $temperature = (float)Settings::getFieldSetting($this->modx, $field, 'temperature');
            $maxTokens = (int)Settings::getFieldSetting($this->modx, $field, 'max_tokens');
        } catch (RequiredSettingException $e) {
            return $this->failure($e->getMessage());
        }

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
