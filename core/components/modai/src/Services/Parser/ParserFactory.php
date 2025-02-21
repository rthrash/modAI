<?php
namespace modAI\Services\Parser;

use modAI\Exceptions\LexiconException;

class ParserFactory {
    /**
     * @throws LexiconException
     */
    public static function getParser(string $service): string
    {
        if ($service === 'chatgpt') {
            return ChatGPT::class;
        }

        if ($service === 'claude') {
            return Claude::class;
        }

        if ($service === 'gemini') {
            return Gemini::class;
        }

        throw new LexiconException("modai.cmp.service_unsupported");
    }
}
