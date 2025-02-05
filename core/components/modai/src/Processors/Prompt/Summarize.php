<?php
namespace modAI\Processors\Prompt;

use modAI\Services\ChatGPT;
use MODX\Revolution\modX;
use MODX\Revolution\Processors\Processor;

class Summarize extends Processor
{

    public function process()
    {
        $id = $this->modx->getOption('id', $_REQUEST, 0);
        if (empty($id)) {
            return $this->failure('No resource specified.');
        }

        $resource = $this->modx->getObject('modResource', $id);
        if (!$resource) {
            return $this->failure('Resource not found.');
        }

        $content = $resource->getContent();
        if (empty($content)) {
            return $this->failure('There\'s no content');
        }

        $chatGPT = new ChatGPT($this->modx);

        $prompt = "Summarize the following content into a concise, SEO optimized meta description:\n\n" . $content;

        $this->modx->log(modX::LOG_LEVEL_INFO, 'AutoSummaryProcessor: Prompt for ChatGPT: ' . $prompt);

        $data = [
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an assistant that creates SEO optimized meta descriptions.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'max_tokens' => 60,
            'temperature' => 0.7
        ];

        try {
            $result = $chatGPT->getCompletions($data);

            if (!isset($result['choices'][0]['message']['content'])) {
                return $this->failure('Error from ChatGPT API: ' . print_r($result, true));
            }

            $summary = trim($result['choices'][0]['message']['content']);

            return $this->success('', ['summary' => $summary]);
        } catch (\Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

}
