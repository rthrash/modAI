<?php
namespace modAI\Services\Config;

class CompletionsConfig {
    use Model, CustomOptions;

    private float $temperature;
    private int $maxTokens;
    private string $systemInstructions = '';

    public function temperature(float $temperature): self {
        $this->temperature = $temperature;

        return $this;
    }

    public function maxTokens(int $maxTokens): self {
        $this->maxTokens = $maxTokens;

        return $this;
    }

    public function systemInstructions(array $systemInstructions): self {
        $this->systemInstructions = implode("\n", $systemInstructions);

        return $this;
    }

    public function getTemperature(): float
    {
        return $this->temperature;
    }

    public function getMaxTokens(): int
    {
        return $this->maxTokens;
    }

    public function getSystemInstructions(): string
    {
        return $this->systemInstructions;
    }


}
