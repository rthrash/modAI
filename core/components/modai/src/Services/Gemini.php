<?php
namespace modAI\Services;

use modAI\Exceptions\LexiconException;
use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use modAI\Services\Response\AIResponse;
use MODX\Revolution\modX;

class Gemini implements AIService {
    private modX $modx;

    const COMPLETIONS_API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}';
    const COMPLETIONS_STREAM_API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={apiKey}';
    const IMAGES_API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:predict?key={apiKey}';

    public function __construct(modX &$modx)
    {
        $this->modx =& $modx;
    }

    public function getCompletions(array $data, CompletionsConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.gemini.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'gemini']);
        }

        $url = self::COMPLETIONS_API;

        if ($config->isStream()) {
            $url = self::COMPLETIONS_STREAM_API;
        }

        $url = str_replace("{model}", $config->getModel(), $url);
        $url = str_replace("{apiKey}", $apiKey, $url);

        $systemInstruction = [];

        $system = $config->getSystemInstructions();
        if (!empty($system)) {
            $systemInstruction[] = [
                'text' => $system
            ];
        }

        $messages = [];

        foreach ($config->getMessages() as $msg) {
            $messages[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => [
                    ['text' => $msg['content']]
                ]
            ];
        }

        foreach ($data as $msg) {
            $messages[] = [
                'role' => 'user',
                'parts' => [
                    ['text' => $msg]
                ]
            ];
        }

        $input = $config->getCustomOptions();
        $input["contents"] = $messages;

        $input["generationConfig"] = [
            "temperature" => $config->getTemperature(),
            "maxOutputTokens" => $config->getMaxTokens(),
        ];

        if (!empty($systemInstruction)) {
            $input['system_instruction'] = [
                "parts" => $systemInstruction
            ];
        }

        return AIResponse::new('gemini')
            ->withStream($config->isStream())
            ->withParser('content')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->withBody($input);
    }

    public function getVision(string $prompt, string $image, VisionConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.gemini.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'gemini']);
        }

        $image = str_replace('data:image/png;base64,', '', $image);

        $input = $config->getCustomOptions();
        $input['contents'] = [
            'parts' => [
                [
                    "text" => $prompt,
                ],
                [
                    "inline_data" => [
                        "mime_type" => "image/png",
                        "data" => $image,
                    ]
                ],
            ]
        ];

        $url = self::COMPLETIONS_API;

        if ($config->isStream()) {
            $url = self::COMPLETIONS_STREAM_API;
        }

        $url = str_replace("{model}", $config->getModel(), $url);
        $url = str_replace("{apiKey}", $apiKey, $url);

        return AIResponse::new('gemini')
            ->withStream($config->isStream())
            ->withParser('content')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->withBody($input);
    }

    public function generateImage(string $prompt, ImageConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.gemini.key');
        if (empty($apiKey)) {
            throw new LexiconException('modai.error.invalid_api_key', ['service' => 'gemini']);
        }

        $url = self::IMAGES_API;
        $url = str_replace("{model}", $config->getModel(), $url);
        $url = str_replace("{apiKey}", $apiKey, $url);

        $input = $config->getCustomOptions();
        $input["instances"] = [
            "prompt" => $prompt,
        ];
        $input["parameters"] = [
            "sampleCount" => $config->getN()
        ];

        return AIResponse::new('gemini')
            ->withParser('image')
            ->withUrl($url)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->withBody($input);
    }
}
