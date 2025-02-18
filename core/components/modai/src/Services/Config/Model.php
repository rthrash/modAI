<?php
namespace modAI\Services\Config;

trait Model {
    private string $model;

    private function __construct(string $model)
    {
        $this->model = $model;
    }

    public static function new(string $model): self {
        return new self($model);
    }

    public function getModel(): string {
        if (substr($this->model, 0,7) === 'custom_') {
            return substr($this->model, 7);
        }

        return $this->model;
    }
}
