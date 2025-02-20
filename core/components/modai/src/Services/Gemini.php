<?php
namespace modAI\Services;

use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use modAI\Services\Response\AIResponse;
use MODX\Revolution\modX;

class Gemini implements AIService {
    private modX $modx;

    const COMPLETIONS_API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}';
    const IMAGES_API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:predict?key={apiKey}';

    public function __construct(modX &$modx)
    {
        $this->modx =& $modx;
    }

    /**
     * @throws \Exception
     */
    public function getCompletions(array $data, CompletionsConfig $config): AIResponse
    {
        $apiKey = $this->modx->getOption('modai.api.gemini.key');
        if (empty($apiKey)) {
            throw new \Exception($this->modx->lexicon('modai.error.invalid_api_key', ['service' => 'gemini']));
        }

        $url = self::COMPLETIONS_API;
        $url = str_replace("{model}", $config->getModel(), $url);
        $url = str_replace("{apiKey}", $apiKey, $url);

        $systemInstruction = [];

        foreach ($config->getSystemInstructions() as $system) {
            $systemInstruction[] = [
                'text' => $system
            ];
        }

        $messages = [];
        foreach ($data as $msg) {
            $messages[] = [
                'text' => $msg
            ];
        }

        $input = [
            "contents" => [
                "parts" => $messages,
            ],
            "generationConfig"=> [
                "temperature"=> $config->getTemperature(),
                "maxOutputTokens"=> $config->getMaxTokens(),
            ]
        ];

        if (!empty($systemInstruction)) {
            $input['system_instruction'] = [
                "parts" => $systemInstruction
            ];
        }

        return AIResponse::new('gemini')
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
            throw new \Exception($this->modx->lexicon('modai.error.invalid_api_key', ['service' => 'gemini']));
        }

        $image = str_replace('data:image/png;base64,', '', $image);

        $input = [
            'contents' => [
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
            ],
        ];

        $url = self::COMPLETIONS_API;
        $url = str_replace("{model}", $config->getModel(), $url);
        $url = str_replace("{apiKey}", $apiKey, $url);

        return AIResponse::new('gemini')
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
            throw new \Exception($this->modx->lexicon('modai.error.invalid_api_key', ['service' => 'gemini']));
        }

        $url = self::IMAGES_API;
        $url = str_replace("{model}", $config->getModel(), $url);
        $url = str_replace("{apiKey}", $apiKey, $url);

        $input = [
            "instances" => [
                "prompt" => $prompt,
            ],
            "parameters" => [
                "sampleCount" => $config->getN()
            ]
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
