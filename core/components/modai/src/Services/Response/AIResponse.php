<?php
namespace modAI\Services\Response;

class AIResponse {
    private string $service;
    private string $url;
    private string $parser;
    private array $headers = [];
    private array $body = [];

    private function __construct(string $service)
    {
        $this->service = $service;
    }

    public static function new(string $service): self {
        return new self($service);
    }

    public function withUrl(string $url): self {
        $this->url = $url;
        return $this;
    }

    public function withHeaders(array $headers): self
    {
        $this->headers = $headers;
        return $this;
    }

    public function withBody(array $body): self
    {
        $this->body = $body;
        return $this;
    }

    public function withParser(string $parser): self
    {
        $this->parser = $parser;
        return $this;
    }

    public function toArray(): array
    {
        return [
            'service' => $this->service,
            'parser' => $this->parser,
            'url' => $this->url,
            'headers' => $this->headers,
            'body' => json_encode($this->body)
        ];
    }

}
