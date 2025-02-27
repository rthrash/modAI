<?php
namespace modAI\Services\Config;

class VisionConfig {
    use Model, CustomOptions;

    private bool $stream = false;

    public function stream(bool $stream): self {
        $this->stream = $stream;

        return $this;
    }

    public function isStream(): bool
    {
        return $this->stream;
    }
}
