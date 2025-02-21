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

        foreach ($config->getSystemInstructions() as $system) {
            $messages[] = [
                'role' => 'system',
                'content' => $system
            ];
        }

        foreach ($data as $msg) {
            $messages[] = [
                'role' => 'user',
                'content' => $msg
            ];
        }

        $input = [
            'model' => $config->getModel(),
            'max_tokens' => $config->getMaxTokens(),
            'temperature' => $config->getTemperature(),
            'messages' => $messages,
        ];

        $url = self::COMPLETIONS_API;
        $url = str_replace('{url}', $baseUrl, $url);

        return AIResponse::new($this->modx,'chatgpt')
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

        $input = [
            'model' => $config->getModel(),
            'messages' => [
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
            ],
        ];

        $url = self::COMPLETIONS_API;
        $url = str_replace('{url}', $baseUrl, $url);

        return AIResponse::new($this->modx,'chatgpt')
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

        $input = [
            'prompt' => $prompt,
            'model' => $config->getModel(),
            'n' => $config->getN(),
            'size' => $config->getSize(),
            'quality' => $config->getQuality()
        ];

        $url = self::IMAGES_API;
        $url = str_replace('{url}', $baseUrl, $url);

        return AIResponse::new($this->modx,'chatgpt')
            ->withParser('image')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey
            ])
            ->withBody($input);
    }


}
