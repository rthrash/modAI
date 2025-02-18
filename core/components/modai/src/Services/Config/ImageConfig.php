<?php
namespace modAI\Services\Config;

class ImageConfig {
    private string $model;
    private int $n = 1;
    private string $size;
    private string $quality;

    private function __construct(string $model)
    {
        $this->model = $model;
    }

    public static function new(string $model): self {
        return new self($model);
    }

    public function size(string $size): self {
        $this->size = $size;

        return $this;
    }

    public function quality(string $quality): self {
        $this->quality = $quality;

        return $this;
    }

    public function getModel(): string {
        return $this->model;
    }

    public function getN(): int
    {
        return $this->n;
    }

    public function getSize(): string
    {
        return $this->size;
    }

    public function getQuality(): string
    {
        return $this->quality;
    }

}
