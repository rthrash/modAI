<?php
namespace modAI\Services\Config;

class VisionConfig {
    private string $model;

    private function __construct(string $model)
    {
        $this->model = $model;
    }

    public static function new(string $model): self {
        return new self($model);
    }

    public function getModel(): string {
        return $this->model;
    }


}
