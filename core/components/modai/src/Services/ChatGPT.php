<?php
namespace modAI\Services;

use \MODX\Revolution\modX;

class ChatGPT
{
    private modX $modx;

    const COMPLETIONS_API = 'https://api.openai.com/v1/chat/completions';
    const IMAGES_API = 'https://api.openai.com/v1/images/generations';

    public function __construct(modX &$modx)
    {
        $this->modx =& $modx;
    }

    public function generateImage(array $data) {
        $chatgptApiKey = $this->modx->getOption('modai.chatgpt.key');
        if (empty($chatgptApiKey)) {
            throw new \Exception('Missing modai.chatgpt.key');
        }

        $ch = curl_init(self::IMAGES_API);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $chatgptApiKey
        ]);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            throw new \Exception($error_msg);
        }

        curl_close($ch);

        $result = json_decode($response, true);
        if (!is_array($result)) {
            throw new \Exception('Invalid response');
        }

        if (isset($result['error'])) {
            throw new \Exception($result['error']['message']);
        }

        return $result;
    }

    /**
     * @throws \Exception
     */
    public function getCompletions(array $data)
    {
        $chatgptApiKey = $this->modx->getOption('modai.chatgpt.key');
        if (empty($chatgptApiKey)) {
            throw new \Exception('Missing modai.chatgpt.key');
        }

        $ch = curl_init(self::COMPLETIONS_API);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $chatgptApiKey
        ]);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            throw new \Exception($error_msg);
        }

        curl_close($ch);

        $result = json_decode($response, true);
        if (!is_array($result)) {
            throw new \Exception('Invalid response');
        }

        if (isset($result['error'])) {
            throw new \Exception($result['error']['message']);
        }

        return $result;
    }

}
