<?php
namespace modAI\Services\Config;

class CompletionsConfig {
    private string $model;
    private float $temperature;
    private int $maxTokens;
    private array $systemInstructions = [];

    private function __construct(string $model)
    {
        $this->model = $model;
    }

    public static function new(string $model): self {
        return new self($model);
    }

    public function temperature(float $temperature): self {
        $this->temperature = $temperature;

        return $this;
    }

    public function maxTokens(int $maxTokens): self {
        $this->maxTokens = $maxTokens;

        return $this;
    }

    public function systemInstructions(array $systemInstructions): self {
        $this->systemInstructions = $systemInstructions;

        return $this;
    }

    public function getModel(): string {
        return $this->model;
    }

    public function getTemperature(): float
    {
        return $this->temperature;
    }

    public function getMaxTokens(): int
    {
        return $this->maxTokens;
    }

    public function getSystemInstructions(): array
    {
        return $this->systemInstructions;
    }


}
