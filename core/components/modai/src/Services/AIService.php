<?php

namespace modAI\Services;

use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;
use modAI\Services\Response\AIResponse;

interface AIService {

    public function getCompletions(array $data, CompletionsConfig $config): AIResponse;
    public function getVision(string $prompt, string $image, VisionConfig $config): AIResponse;
    public function generateImage(string $prompt, ImageConfig $config): AIResponse;
}
