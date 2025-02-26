<?php

namespace modAI\Processors\Prompt;

use modAI\Services\AIServiceFactory;
use modAI\Services\Config\ImageConfig;
use modAI\Settings;
use MODX\Revolution\Processors\Processor;

class Image extends Processor
{
    public function process()
    {
        return $this->success('', ['url' => "https://oaidalleapiprodscus.blob.core.windows.net/private/org-mVSFcxs98WiJjLumY11bjhrz/user-9JkYqLT6GTOuJBFdlVL6iJFG/img-fNJLWDbAbSp30duoakZHlkT5.png?st=2025-02-26T09%3A37%3A52Z&se=2025-02-26T11%3A37%3A52Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-02-25T20%3A07%3A56Z&ske=2025-02-26T20%3A07%3A56Z&sks=b&skv=2024-08-04&sig=6pAjPpBEVJ56U6rLdQjvnZXKVPcjp8XnuX/pXJhYvPQ%3D"]);
        set_time_limit(0);

        $prompt = $this->getProperty('prompt');
        $field = $this->getProperty('field', '');
        $namespace = $this->getProperty('namespace', 'modai');

        if (empty($prompt)) {
            return $this->failure($this->modx->lexicon('modai.error.prompt_required'));
        }

        try {
            $model = Settings::getImageSetting($this->modx, $field, 'model', $namespace);
            $size = Settings::getImageSetting($this->modx, $field, 'size', $namespace);
            $quality = Settings::getImageSetting($this->modx, $field, 'quality', $namespace);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }

        try {
            $aiService = AIServiceFactory::new($model, $this->modx);
            $result = $aiService->generateImage($prompt, ImageConfig::new($model)->size($size)->quality($quality));

            return $this->success('', $result->generate());
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
