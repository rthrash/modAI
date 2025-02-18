<?php
namespace modAI\Services;

use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use MODX\Revolution\modX;

class Anthropic implements AIService
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
    public function getCompletions(array $data, CompletionsConfig $config): string
    {
        $apiKey = $this->modx->getOption('modai.anthropic.key');
        if (empty($apiKey)) {
            throw new \Exception('Missing modai.anthropic.key');
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

        $ch = curl_init(self::COMPLETIONS_API);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'anthropic-version: 2023-06-01',
            'x-api-key: ' . $apiKey
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

        if (!isset($result['content'][0]['text'])) {
            throw new \Exception("There was an error generating a response.");
        }

        return $result['content'][0]['text'];
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
