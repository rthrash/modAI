<?php
namespace modAI\Services\Executor;

use modAI\Exceptions\LexiconException;
use modAI\Services\Parser\ParserFactory;
use modAI\Services\Response\AIResponse;

class ServiceExecutor {
    /**
     * @throws LexiconException
     * @throws \Exception
     */
    public static function execute(AIResponse $details): array
    {
        $headers = [];

        foreach ($details->getHeaders() as $key => $value) {
            $headers[] = "$key:$value";
        }

        $ch = curl_init($details->getUrl());
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $details->getBody());
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            throw new \Exception($error_msg);
        }

        curl_close($ch);

        $result = json_decode($response, true);
        if (!is_array($result)) {
            throw new LexiconException('modai.cmp.failed_request');
        }

        if (isset($result['error'])) {
            throw new \Exception($result['error']['message']);
        }

        $parser = ParserFactory::getParser($details->getService());
        if (!method_exists($parser, $details->getParser())) {
            throw new LexiconException("modai.cmp.service_unsupported");
        }

        return $parser::{$details->getParser()}($result);
    }
}
