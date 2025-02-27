<?php
namespace modAI\Services\Response;

use modAI\Exceptions\LexiconException;
use modAI\Services\Executor\ServiceExecutor;
use modAI\Settings;
use MODX\Revolution\modX;

class AIResponse {
    private modX $modx;
    private string $service;
    private string $url;
    private string $parser;
    private array $headers = [];
    private array $body = [];
    private bool $stream = false;

    private function __construct(modX &$modx, string $service)
    {
        $this->modx =& $modx;
        $this->service = $service;
    }

    public static function new(modX &$modx, string $service): self {
        return new self($modx, $service);
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

    public function withStream(bool $stream): self
    {
        $this->stream = $stream;
        return $this;
    }

    public function getService(): string
    {
        return $this->service;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getParser(): string
    {
        return $this->parser;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getBody(): string
    {
        return json_encode($this->body);
    }

    public function getStream(): bool
    {
        return $this->stream;
    }

    /**
     * @throws LexiconException
     * @throws \Exception
     */
    public function generate(): array
    {
        $onServer = intval(Settings::getApiSetting($this->modx, $this->service, 'execute_on_server')) === 1;

        if ($onServer) {
            return ServiceExecutor::execute($this);
        }

        return [
            'forExecutor' => [
                'service' => $this->getService(),
                'stream' => $this->getStream(),
                'parser' => $this->getParser(),
                'url' => $this->getUrl(),
                'headers' => $this->getHeaders(),
                'body' => $this->getBody()
            ]
        ];
    }

}
