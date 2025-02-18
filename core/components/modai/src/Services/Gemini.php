<?php
namespace modAI\Services;

use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use MODX\Revolution\modX;

class Gemini implements AIService {
    private modX $modx;

    const COMPLETIONS_API = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}';

    public function __construct(modX &$modx)
    {
        $this->modx =& $modx;
    }

    /**
     * @throws \Exception
     */
    public function getCompletions(array $data, CompletionsConfig $config): string
    {
        $apiKey = $this->modx->getOption('modai.gemini.key');
        if (empty($apiKey)) {
            throw new \Exception('Missing modai.gemini.key');
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
            "system_instruction" => [
                "parts" => $systemInstruction
            ],
            "generationConfig"=> [
                "temperature"=> $config->getTemperature(),
                "maxOutputTokens"=> $config->getMaxTokens(),
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            throw new \Exception($error_msg);
        }

        curl_close($ch);

        $result = json_decode($response, true);
        if (!is_array($result)) {
            throw new \Exception('Invalid response');
        }

        if (isset($result['error'])) {
            throw new \Exception($result['error']['message']);
        }

        if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception("There was an error generating a response.");
        }

        return $result['candidates'][0]['content']['parts'][0]['text'];
    }

    public function getVision(string $prompt, string $image, VisionConfig $config): string
    {
        throw new \Exception("not implemented");
    }

    public function generateImage(string $prompt, ImageConfig $config): string
    {
        throw new \Exception("not implemented");
    }
}
