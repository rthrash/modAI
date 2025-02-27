<?php
namespace modAI\Processors\Prompt;

use modAI\Exceptions\LexiconException;
use modAI\Services\AIServiceFactory;
use modAI\Services\Config\CompletionsConfig;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class FreeText extends Processor
{
    public function process()
    {
        set_time_limit(0);

        $prompt = $this->getProperty('prompt');
        $field = $this->getProperty('field', '');
        $context = $this->getProperty('context', '');
        $namespace = $this->getProperty('namespace', 'modai');

        if (empty($prompt)) {
            return $this->failure($this->modx->lexicon('modai.error.prompt_required'));
        }

        $systemInstructions = [];

        try {
            $stream = intval(Settings::getTextSetting($this->modx, $field, 'stream', $namespace)) === 1;
            $model = Settings::getTextSetting($this->modx, $field, 'model', $namespace);
            $temperature = (float)Settings::getTextSetting($this->modx, $field, 'temperature', $namespace);
            $maxTokens = (int)Settings::getTextSetting($this->modx, $field, 'max_tokens', $namespace);
            $output = Settings::getTextSetting($this->modx, $field, 'base_output', $namespace, false);
            $base = Settings::getTextSetting($this->modx, $field, 'base_prompt', $namespace, false);
            $contextPrompt = Settings::getTextSetting($this->modx, $field, 'context_prompt', $namespace, false);
            $customOptions = Settings::getTextSetting($this->modx, $field, 'custom_options', $namespace, false);

            if (!empty($output)) {
                $systemInstructions[] = $output;
            }

            if (!empty($base)) {
                $systemInstructions[] = $base;
            }

            if (!empty($context) && !empty($contextPrompt)) {
                $systemInstructions[] = str_replace('{context}', $context, $contextPrompt);
            }

            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->getCompletions(
                [$prompt],
                CompletionsConfig::new($model)
                    ->customOptions($customOptions)
                    ->maxTokens($maxTokens)
                    ->temperature($temperature)
                    ->systemInstructions($systemInstructions)
                    ->stream($stream)
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
