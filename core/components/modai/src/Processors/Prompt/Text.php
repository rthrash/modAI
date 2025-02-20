<?php
namespace modAI\Processors\Prompt;

use modAI\RequiredSettingException;
use modAI\Services\AIServiceFactory;
use modAI\Services\ChatGPT;
use modAI\Services\Config\CompletionsConfig;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class Text extends Processor
{
    private static array $validFields = ['res.pagetitle', 'res.longtitle', 'res.introtext', 'res.description'];

    public function process()
    {
        set_time_limit(0);

        $fields = array_flip(self::$validFields);
        $field = $this->getProperty('field', '');

        if (substr($field, 0, 3) === 'tv.') {
            $modAi = $this->modx->services->get('modai');
            $tvs = $modAi->getListOfTVs();
            $tvs = array_flip($tvs);

            $tvName = substr($field, 3);

            if (!isset($tvs[$tvName])) {
                return $this->failure($this->modx->lexicon('modai.error.unsupported_tv'));
            }
        } else {
            if (!isset($fields[$field])) {
                return $this->failure($this->modx->lexicon('modai.error.unsupported_field'));
            }
        }

        $id = $this->getProperty('id');
        if (empty($id)) {
            return $this->failure($this->modx->lexicon('modai.error.no_resource_specified'));
        }

        $resource = $this->modx->getObject('modResource', $id);
        if (!$resource) {
            return $this->failure($this->modx->lexicon('modai.error.no_resource_found'));
        }

        $content = $resource->getContent();
        if (empty($content)) {
            return $this->failure($this->modx->lexicon('modai.error.no_content'));
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

        try {
            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->getCompletions([$content], CompletionsConfig::new($model)->maxTokens($maxTokens)->temperature($temperature)->systemInstructions($systemInstructions));

            return $this->success('', $result->toArray());
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
