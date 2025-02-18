<?php
namespace modAI\Services;

use MODX\Revolution\modX;

class AIServiceFactory {
    public static function new($model, modX &$modx): AIService {
        if (substr($model, 0, 7) === 'gemini-') {
            return new Gemini($modx);
        }

        if (substr($model, 0, 7) === 'claude-') {
            return new Anthropic($modx);
        }

        switch ($model) {
            case 'text-embedding-004':
            case 'learnlm-1.5-pro-experimental':
                return new Gemini($modx);
            default:
                return new ChatGPT($modx);
        }
    }
}
