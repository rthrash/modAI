<?php

namespace modAI\Processors\Download;

use MODX\Revolution\Processors\Processor;
use MODX\Revolution\Sources\modMediaSource;

class Image extends Processor {
    public function process() {
        $resource = $this->getProperty('resource');
        $url = $this->getProperty('url');

        if (empty($resource)) {
            return $this->failure("Resource is required");
        }

        if (empty($url)) {
            return $this->failure('URL is required');
        }

        $source = modMediaSource::getDefaultSource($this->modx, 1);

        if (!$source->initialize()) {
            return $this->failure('fail');
        }

        $dir = "assets/ai/$resource/";
        $name = md5(microtime()) . '.png';

        $source->createObject($dir, $name, file_get_contents($url));

        return $this->success('', ['url' => $dir.$name]);
    }
}
