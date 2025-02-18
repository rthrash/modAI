<?php
namespace modAI\Processors\Prompt;

use modAI\RequiredSettingException;
use modAI\Services\AIServiceFactory;
use modAI\Services\Config\CompletionsConfig;
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

        $systemInstructions = [];

        try {
            $model = Settings::getFieldSetting($this->modx, $field, 'model');
            $temperature = (float)Settings::getFieldSetting($this->modx, $field, 'temperature');
            $maxTokens = (int)Settings::getFieldSetting($this->modx, $field, 'max_tokens');
            $output = Settings::getFieldSetting($this->modx, $field, 'base.output', false);
        } catch (RequiredSettingException $e) {
            return $this->failure($e->getMessage());
        }

        if (!empty($output)) {
            $systemInstructions[] = $output;
        }

        $base = Settings::getPrompt($this->modx, 'global.base');
        if (!empty($base)) {
            $systemInstructions[] = $base;
        }

        $fieldPrompt = Settings::getPrompt($this->modx, $field);
        if (!empty($fieldPrompt)) {
            $systemInstructions[] = $fieldPrompt;
        }

        $aiService = AIServiceFactory::new($model, $this->modx);

        try {
            $result = $aiService->getCompletions([$content], CompletionsConfig::new($model)->maxTokens($maxTokens)->temperature($temperature)->systemInstructions($systemInstructions));

            return $this->success('', ['content' => $result]);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
