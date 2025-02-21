<?php
namespace modAI\Services\Parser;

use modAI\Exceptions\LexiconException;

class Gemini implements Parser {
    public static function content(array $data): array
    {
        if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            throw new LexiconException("serviceExecutor.js");
        }

        return [
            'content' => $data['candidates'][0]['content']['parts'][0]['text']
        ];
    }

    public static function image(array $data): array
    {
        if (!isset($data['predictions'][0]['bytesBase64Encoded'])) {
            throw new LexiconException("serviceExecutor.js");
        }

        return [
            'base64' => "data:image/png;base64," . $data['predictions'][0]['bytesBase64Encoded']
        ];
    }
}
