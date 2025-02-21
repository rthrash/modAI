<?php
namespace modAI\Services\Parser;

use modAI\Exceptions\LexiconException;

class ChatGPT implements Parser {
    public static function content(array $data): array
    {
        if (!isset($data['choices'][0]['message']['content'])) {
            throw new LexiconException("serviceExecutor.js");
        }

        return [
            'content' => $data['choices'][0]['message']['content']
        ];
    }

    public static function image(array $data): array
    {
        if (!isset($data['data'][0]['url'])) {
            throw new LexiconException("serviceExecutor.js");
        }

        return [
            'url' => $data['data'][0]['url']
        ];
    }
}
