<?php
namespace modAI\API\Prompt;

use modAI\API\API;
use modAI\Exceptions\LexiconException;
use modAI\Services\AIServiceFactory;
use modAI\Services\Config\CompletionsConfig;
use modAI\Settings;
use Psr\Http\Message\ServerRequestInterface;

class FreeText extends API
{
    public function post(ServerRequestInterface $request): void
    {
        set_time_limit(0);

        $data = $request->getParsedBody();

        $prompt = $this->modx->getOption('prompt', $data);
        $field = $this->modx->getOption('field', $data, '');
        $context = $this->modx->getOption('context', $data, '');
        $namespace = $this->modx->getOption('namespace', $data, 'modai');

        if (empty($prompt)) {
            throw new LexiconException('modai.error.prompt_required');
        }

        $systemInstructions = [];

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

        $this->proxyAIResponse($result);
    }
}
