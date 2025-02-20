<?php
namespace modAI\Services;

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

    /**
     * @throws \Exception
     */
    public function getCompletions(array $data, CompletionsConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.claude.key');
        if (empty($apiKey)) {
            throw new \Exception($this->modx->lexicon('modai.error.invalid_api_key', ['service' => 'claude']));
        }

        $messages = [];

        $system = implode(';', $config->getSystemInstructions());

        foreach ($data as $msg) {
            $messages[] = [
                'role' => 'user',
                'content' => $msg
            ];
        }

        $input = [
            "model" => $config->getModel(),
            "max_tokens"=> $config->getMaxTokens(),
            "temperature"=> $config->getTemperature(),
            "messages" => $messages
        ];

        if (!empty($system)) {
            $input['system'] = $system;
        }

        return AIResponse::new('claude')
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
        throw new \Exception($this->modx->lexicon('modai.error.not_implemented'));
    }

    public function generateImage(string $prompt, ImageConfig $config): AIResponse
    {
        throw new \Exception($this->modx->lexicon('modai.error.not_implemented'));
    }

}
