<?php
namespace modAI\Processors\Prompt;

use modAI\Exceptions\LexiconException;
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
        set_time_limit(0);

        $namespace = $this->getProperty('namespace', 'modai');

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
            $model = Settings::getTextSetting($this->modx, $field, 'model', $namespace);
            $temperature = (float)Settings::getTextSetting($this->modx, $field, 'temperature', $namespace);
            $maxTokens = (int)Settings::getTextSetting($this->modx, $field, 'max_tokens', $namespace);
            $output = Settings::getTextSetting($this->modx, $field, 'base_output', $namespace, false);
            $base = Settings::getTextSetting($this->modx, $field, 'base_prompt', $namespace, false);
            $fieldPrompt = Settings::getTextSetting($this->modx, $field, 'prompt', $namespace);
            $customOptions = Settings::getTextSetting($this->modx, $field, 'custom_options', $namespace, false);
        } catch (RequiredSettingException $e) {
            return $this->failure($e->getMessage());
        }

        if (!empty($output)) {
            $systemInstructions[] = $output;
        }

        if (!empty($base)) {
            $systemInstructions[] = $base;
        }

        if (!empty($fieldPrompt)) {
            $systemInstructions[] = $fieldPrompt;
        }

        try {
            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->getCompletions(
                [$content],
                CompletionsConfig::new($model)
                    ->customOptions($customOptions)
                    ->maxTokens($maxTokens)
                    ->temperature($temperature)
                    ->systemInstructions($systemInstructions)
            );

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
