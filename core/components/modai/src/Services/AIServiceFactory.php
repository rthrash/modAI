<?php
namespace modAI\Services;

use MODX\Revolution\modX;

class AIServiceFactory {
    public static function new($model, modX &$modx): AIService {
        if (substr($model, 0, 7) === 'gemini-') {
            return new Gemini($modx);
        }

        if (substr($model, 0, 7) === 'claude-') {
            return new Claude($modx);
        }

        if (substr($model, 0,7) === 'custom_') {
            $compatibility = $modx->getOption('modai.api.custom.compatibility');
            if ($compatibility === 'openai') {
                return new CustomChatGPT($modx);
            }

            throw new \Error("Unsupported API compatibility mode (modai.api.custom.compatibility).");
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
