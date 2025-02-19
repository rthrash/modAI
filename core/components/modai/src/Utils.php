<?php
namespace modAI;

class Utils {
    public static function explodeAndClean(string $stringArray, string $delimiter = ',', bool $keepDuplicates = false): array
    {
        $array = explode($delimiter, $stringArray);
        $array = array_map('trim', $array);

        if ($keepDuplicates == 0) {
            $array = array_keys(array_flip($array));
        }

        return array_filter($array);
    }
}
