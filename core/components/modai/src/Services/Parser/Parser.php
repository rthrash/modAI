<?php
namespace modAI\Services\Parser;

use modAI\Exceptions\LexiconException;

interface Parser {
    /**
     * @throws LexiconException
     */
    public static function content(array $data): array;

    /**
     * @throws LexiconException
     */
    public static function image(array $data): array;
}
