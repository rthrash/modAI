<?php
namespace modAI\Services;

use modAI\Exceptions\LexiconException;
use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use modAI\Services\Response\AIResponse;
use MODX\Revolution\modX;

class CustomChatGPT implements AIService
{
    private modX $modx;

    const COMPLETIONS_API = '{url}/chat/completions';
    const IMAGES_API = '{url}/images/generations';

    public function __construct(modX &$modx)
    {
        $this->modx =& $modx;
    }

    public function getCompletions(array $data, CompletionsConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.custom.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'custom']);
        }

        $baseUrl = $this->modx->getOption('modai.api.custom.url');
        if (empty($baseUrl)) {
            throw new LexiconException('modai.error.invalid_url');
        }

        $messages = [];

        $system = $config->getSystemInstructions();
        if (!empty($system)) {
            $messages[] = [
                'role' => 'system',
                'content' => $system
            ];
        }

        foreach ($config->getMessages() as $msg) {
            $messages[] = [
                'role' => 'user',
                'content' => $msg['user']
            ];

            $messages[] = [
                'role' => 'assistant',
                'content' => $msg['assistant']
            ];
        }

        foreach ($data as $msg) {
            $messages[] = [
                'role' => 'user',
                'content' => $msg
            ];
        }

        $input = $config->getCustomOptions();
        $input['model'] = $config->getModel();
        $input['max_tokens'] = $config->getMaxTokens();
        $input['temperature'] = $config->getTemperature();
        $input['messages'] = $messages;

        if ($config->isStream()) {
            $input['stream'] = true;
        }

        $url = self::COMPLETIONS_API;
        $url = str_replace('{url}', $baseUrl, $url);

        return AIResponse::new('chatgpt')
            ->withStream($config->isStream())
            ->withParser('content')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey
            ])
            ->withBody($input);
    }

    public function getVision(string $prompt, string $image, VisionConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.custom.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'custom']);
        }

        $baseUrl = $this->modx->getOption('modai.api.custom.url');
        if (empty($baseUrl)) {
            throw new LexiconException('modai.error.invalid_url');
        }

        $input = $config->getCustomOptions();
        $input['model'] = $config->getModel();
        $input['messages'] = [
            [
                'role' => 'user',
                'content' => [
                    [
                        "type"=> "text",
                        "text"=> $prompt,
                    ],
                    [
                        "type" => "image_url",
                        "image_url" => ["url" => $image],
                    ],
                ]
            ]
        ];

        if ($config->isStream()) {
            $input['stream'] = true;
        }

        $url = self::COMPLETIONS_API;
        $url = str_replace('{url}', $baseUrl, $url);

        return AIResponse::new('chatgpt')
            ->withStream($config->isStream())
            ->withParser('content')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey
            ])
            ->withBody($input);
    }

    public function generateImage(string $prompt, ImageConfig $config): AIResponse {
        $apiKey = $this->modx->getOption('modai.api.custom.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'custom']);
        }

        $baseUrl = $this->modx->getOption('modai.api.custom.url');
        if (empty($baseUrl)) {
            throw new LexiconException('modai.error.invalid_url');
        }

        $input = $config->getCustomOptions();
        $input['prompt'] = $prompt;
        $input['model'] = $config->getModel();
        $input['n'] = $config->getN();
        $input['size'] = $config->getSize();
        $input['quality'] = $config->getQuality();

        $url = self::IMAGES_API;
        $url = str_replace('{url}', $baseUrl, $url);

        return AIResponse::new('chatgpt')
            ->withParser('image')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey
            ])
            ->withBody($input);
    }


}
