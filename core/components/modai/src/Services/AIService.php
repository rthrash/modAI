<?php

namespace modAI\Services;

use modAI\Services\Config\CompletionsConfig;
use modAI\Services\Config\ImageConfig;
use modAI\Services\Config\VisionConfig;

interface AIService {

    public function getCompletions(array $data, CompletionsConfig $config): string;
    public function getVision(string $prompt, string $image, VisionConfig $config): string;
    public function generateImage(string $prompt, ImageConfig $config): array;
}
