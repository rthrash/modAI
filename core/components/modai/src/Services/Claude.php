<?php
namespace modAI\Services;

use modAI\Exceptions\LexiconException;
use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use modAI\Services\Response\AIResponse;
use MODX\Revolution\modX;

class Claude implements AIService
{
    private modX $modx;

    const COMPLETIONS_API = 'https://api.anthropic.com/v1/messages';

    public function __construct(modX &$modx)
    {
        $this->modx =& $modx;
    }

    public function getCompletions(array $data, CompletionsConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.claude.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'claude']);
        }

        $messages = [];

        foreach ($data as $msg) {
            $messages[] = [
                'role' => 'user',
                'content' => $msg
            ];
        }

        $input = $config->getCustomOptions();
        $input["model"] = $config->getModel();
        $input["max_tokens"] = $config->getMaxTokens();
        $input["temperature"] = $config->getTemperature();
        $input["messages"] = $messages;

        $system = $config->getSystemInstructions();
        if (!empty($system)) {
            $input['system'] = $system;
        }

        return AIResponse::new($this->modx,'claude')
            ->withParser('content')
            ->withUrl(self::COMPLETIONS_API)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'anthropic-version' => '2023-06-01',
                'x-api-key' =>  $apiKey
            ])
            ->withBody($input);
    }

    public function getVision(string $prompt, string $image, VisionConfig $config): AIResponse
    {
        throw new LexiconException('modai.error.not_implemented');
    }

    public function generateImage(string $prompt, ImageConfig $config): AIResponse
    {
        throw new LexiconException('modai.error.not_implemented');
    }

}
