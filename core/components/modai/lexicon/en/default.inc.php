<?php

$_lang['modai.cmp.image'] = 'Image';
$_lang['modai.cmp.text'] = 'Text';
$_lang['modai.cmp.prompt'] = 'Prompt';
$_lang['modai.cmp.prompt_required'] = 'Prompt is required';
$_lang['modai.cmp.generate_image'] = 'Generate Image';
$_lang['modai.cmp.generate_ing'] = 'Generating...';
$_lang['modai.cmp.please_wait'] = 'Please wait';
$_lang['modai.cmp.failed'] = 'Failed';
$_lang['modai.cmp.failed_request'] = 'Failed to process your request.';
$_lang['modai.cmp.failed_try_again'] = 'Failed to generate. Please try again. [[+msg]]';
$_lang['modai.cmp.failed_copy'] = 'Failed to copy the generated text. Please try again.';
$_lang['modai.cmp.service_required'] = 'Service is required';
$_lang['modai.cmp.service_unsupported'] = 'Unsupported Service/Parser';

$_lang['setting_modai.api.chatgpt.key'] = 'ChatGPT API Key';
$_lang['setting_modai.api.chatgpt.key_desc'] = 'Your API key found at https://platform.openai.com/api-keys';
$_lang['setting_modai.api.gemini.key'] = 'Gemini API Key';
$_lang['setting_modai.api.gemini.key_desc'] = 'Your API key found at https://ai.google.dev/gemini-api/docs/api-key';
$_lang['setting_modai.api.claude.key'] = 'Claude API Key';
$_lang['setting_modai.api.claude.key_desc'] = 'Your API key found at https://console.anthropic.com/settings/keys';
$_lang['setting_modai.api.custom.key'] = 'Custom API Key';
$_lang['setting_modai.api.custom.key_desc'] = '';
$_lang['setting_modai.api.custom.url'] = 'Custom API URL';
$_lang['setting_modai.api.custom.url_desc'] = '';
$_lang['setting_modai.api.custom.compatibility'] = 'Custom API Compatibility';
$_lang['setting_modai.api.custom.compatibility_desc'] = 'API compatibility type. Available options: openapi';

$_lang['setting_modai.global.text.base_output'] = 'Base Output Instructions';
$_lang['setting_modai.global.text.base.output_desc'] = 'This tells the model how to ouptut the results to remove commentary, wrapping quotes, etc.';
$_lang['setting_modai.global.text.base_prompt'] = 'Base Prompt';
$_lang['setting_modai.global.text.base_prompt_desc'] = 'This is an overall instruction modifier that is added to each API request by default, similar to what you would enter for Customize ChatGPT on their website.';
$_lang['setting_modai.global.text.max_tokens'] = 'Default Maximum Tokens';
$_lang['setting_modai.global.text.max_tokens_desc'] = 'To manage costs, 1000 tokens is roughly equal to 750 words.';
$_lang['setting_modai.global.text.model'] = 'Default AI Model';
$_lang['setting_modai.global.text.model_desc'] = 'The default model for all prompts unless overridden per prompt.';
$_lang['setting_modai.global.text.temperature'] = 'Default AI Temperature';
$_lang['setting_modai.global.text.temperature_desc'] = 'Higher values like 0.8 will be more random and creative, while values lower than 0.2 will be more focused and deterministic.';
$_lang['setting_modai.global.text.context_prompt'] = 'Context Prompt';
$_lang['setting_modai.global.text.context_prompt_desc'] = 'Prompt that will be used when passing an additional context to the chat.';
$_lang['setting_modai.global.text.stream'] = 'Stream';
$_lang['setting_modai.global.text.stream_desc'] = 'If enabled and execute on server is disabled, supported models will stream the response.';
$_lang['setting_modai.global.text.custom_options'] = 'Custom Options';
$_lang['setting_modai.global.text.custom_options_desc'] = 'A JSON object of custom options passed to the body of the AI request.';

$_lang['setting_modai.global.vision.model'] = 'Vision Model';
$_lang['setting_modai.global.vision.model_desc'] = 'Create text from image inputs. Valid options are o1, gpt-4o, gpt-4o-mini, and gpt-4-turbo.';
$_lang['setting_modai.global.vision.prompt'] = 'Vision Prompt';
$_lang['setting_modai.global.vision.prompt_desc'] = 'By default, this should create a 120 character alt tag based on the vision API output.';
$_lang['setting_modai.global.vision.stream'] = 'Stream';
$_lang['setting_modai.global.vision.stream_desc'] = 'If enabled and execute on server is disabled, supported models will stream the response.';
$_lang['setting_modai.global.vision.custom_options'] = 'Custom Options';
$_lang['setting_modai.global.vision.custom_options_desc'] = 'A JSON object of custom options passed to the body of the AI request.';

$_lang['setting_modai.global.image.model'] = 'Image Model';
$_lang['setting_modai.global.image.model_desc'] = 'Valid options are `dall-e-2` and `dall-e-3` (default). See https://platform.openai.com/docs/guides/images/image-generation-beta for full details including DALL-E-2 specifics.';
$_lang['setting_modai.global.image.size'] = 'Image Dimensions';
$_lang['setting_modai.global.image.size_desc'] = 'Valid options for DALL-E-3 are `1024x1024`, `1792x1024` (default), and `1024x1792`.';
$_lang['setting_modai.global.image.quality'] = 'Image Quallity';
$_lang['setting_modai.global.image.quality_desc'] = 'Valid options are `standard` (default) and `hd`.';
$_lang['setting_modai.global.image.path'] = 'Image Path';
$_lang['setting_modai.global.image.path_desc'] = 'Path including file name where the AI generated image will be stored. Available placeholders: {hash}, {shortHash}, {resourceId}, {year}, {month}, {day}.';
$_lang['setting_modai.global.image.download_domains'] = 'Allowed Download Domains';
$_lang['setting_modai.global.image.download_domains_desc'] = 'Additional domains to allow downloading generated images from.';
$_lang['setting_modai.global.image.media_source'] = 'Media Source';
$_lang['setting_modai.global.image.media_source_desc'] = 'Default media source for image uploads (unless field specifies it\'s own).';
$_lang['setting_modai.global.image.custom_options'] = 'Custom Options';
$_lang['setting_modai.global.image.custom_options_desc'] = 'A JSON object of custom options passed to the body of the AI request.';

$_lang['setting_modai.res.fields'] = 'Use with MODX Resource Fields';
$_lang['setting_modai.res.fields_desc'] = 'The default Resource fields to attached modAI generative AI buttons to.';
$_lang['setting_modai.res.pagetitle.text.prompt'] = '[[*pagetitle]] Propmt';
$_lang['setting_modai.res.pagetitle.text.prompt_desc'] = '';
$_lang['setting_modai.res.longtitle.text.prompt'] = '[[*longtitle]] Propmt';
$_lang['setting_modai.res.longtitle.text.prompt_desc'] = 'Use this for the meta title—also works with SEO Suite.';
$_lang['setting_modai.res.introtext.text.prompt'] = '[[*introtext]] Prompt';
$_lang['setting_modai.res.introtext.text.prompt_desc'] = 'Use this to generate a summary of the page content—used as starting point for image generation.';
$_lang['setting_modai.res.description.text.prompt'] = '[[*description]] Prompt';
$_lang['setting_modai.res.description.text.prompt_desc'] = 'Use this for the meta description—also works with SEO Suite.';

$_lang['setting_modai.tvs'] = 'Use with Template Variables';
$_lang['setting_modai.tvs_desc'] = 'The Template Variable fields to attached modAI generative AI buttons to. Must be a text, textarea, image or Image+ Input Type.';
$_lang['setting_modai.api.execute_on_server'] = 'Execute AI\'s request on server';
$_lang['setting_modai.api.execute_on_server_desc'] = 'If enabled, allAI requests will be executed on server side. Be aware of increased load for your server.';

$_lang['setting_modai.cache.lit'] = 'Last Install Time';
$_lang['setting_modai.cache.lit_desc'] = '';

$_lang['modai.error.compatability_mode'] = "Unsupported API compatibility mode (modai.api.custom.compatibility).";
$_lang['modai.error.invalid_api_key'] = "Missing modai.api.[[+service]].key";
$_lang['modai.error.invalid_url'] = "Missing modai.api.custom.url";
$_lang['modai.error.not_implemented'] = "Method not implemented";
$_lang['modai.error.image_requried'] = "Image is required";
$_lang['modai.error.image_download_domain'] = "Domain not allowed for image downloads.";
$_lang['modai.error.unsupported_tv'] = "Unsupported TV";
$_lang['modai.error.unsupported_field'] = "Unsupported Field";
$_lang['modai.error.no_resource_specified'] = "No resource specified";
$_lang['modai.error.no_resource_found'] = "Resource not found";
$_lang['modai.error.no_content'] = "Content is empty";
$_lang['modai.error.image_required'] = "Image or URL is required";
$_lang['modai.error.ms_required'] = "Media Source is required";
$_lang['modai.error.prompt_required'] = "Prompt is required";
$_lang['modai.error.resource_required'] = "Resource is required";
