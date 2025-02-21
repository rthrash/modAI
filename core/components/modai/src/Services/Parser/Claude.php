<?php
namespace modAI\Services\Parser;

use modAI\Exceptions\LexiconException;

class Claude implements Parser {
    public static function content(array $data): array
    {
        if (!isset($data['content'][0]['text'])) {
            throw new LexiconException("serviceExecutor.js");
        }

        return [
            'content' => $data['content'][0]['text']
        ];
    }

    public static function image(array $data): array
    {
        throw new LexiconException('modai.cmp.service_unsupported');
    }
}
