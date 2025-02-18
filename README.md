# modAI
A generative AI Extra for MODX Revolution 3.0 and later. It’s perfect for creating content quickly or speeding up optimizing SEO-related content including page titles, meta titles, meta descriptions, page summaries, and images/alt text (finally, an easy-button for Open Graph sharing images or hero sections).

The modAI Plugin adds a sparkle button (✦) next to fields or labels in back-end Manager for MODX Revolution. When clicked, it:

1. uses field-specific prompts for the type of content being created, 
2. uses a supported AI model API to create said content, and 
3. dumps the result directly into the appropriate field or a textarea that you can copy/paste from (e.g., for longer format articles going into the Content field). 

## Requirements

- MODX Revolution 3.x
- A ChatGPT API key from https://platform.openai.com/api-keys, Google Gemini API key from https://ai.google.dev/gemini-api/docs/api-key or Anthropic Claude API key from https://console.anthropic.com/settings/keys
- Pre-paid credits for API calls for ChatGPT if using—this is different than the $20/month ChatGPT Pro subscription

**Note:** image and vision support is currently only supported with the ChatGPT APIs. Claude and Gemini only support text generation.

MODX’s modAI Extra works with the following Extras if installed:

- **image+** – for things like Open Graph sharing previews or hero section images with robust output templating, resizing, cropping and format conversions in conjunction with **pThumb** https://extras.modx.com/package/imageplustvinput
- **SEO Suite+** – for managing and previewing SEO-related information for your sites https://extras.modx.com/package/seosuite

## Configuration

After installing modAI, update the `modai.chatgpt.key` with your ChatGPT API key and/or the `modai.gemini.key` as appropriate. (Filter by the `modai` namespace to make finding it easier.)

The default fields modAI enables in the `modai.res.fields` setting are longtitle, description, introtext/summary, and content. Attach modAI to other default fields in this setting. 

If you have text, textarea, image or image+ Template Variables you wish to use with modAI, add their TV names to the `modai.tvs` setting (without a `tv.` prefix). 

Customize the base prompts and configurations in the `global`, `image`, `prompt` and `vision` areas of the `modai` namespace in the system settings as needed. The `modai.prompt.base` is roughly equated to a light version of ChatGPT’s custom instructions: it prepends the base prompt to ever other text or textarea prompt, but it does not for image or vision model prompts.

Settings use the following naming convention: `modai.{res||tv}.{field/tv-name}.{setting}` where `{res||tv}` denotes a default MODX Revolution field or a custom Template Variable (TV) and `field/tv-name` is its actual name (e.g., pagetitle, longtitle, fancy-image-tv, etc.).

The `setting` for text or textarea inputs can contain several options below which will override the default settings from the `global` area:

- **model** – for text or textarea, modAI defaults to use `gpt-4o`
- **temperature** – defaults to `0.7`, increase this to 1 for more “creative” results or 0 for highly predictable ones
- **max_tokens** – defaults to `2048`

Image and Image+ fields do not prepend their prompts with the base prompt. Image/Image+ setting defaults in the `image` area include:

- **model** – defaults to `dall-e-3`
- **quality** – defaults to `standard`
- **size** – defaults to `1792x1024`

Image+ fields can use Vision models to describe an imgage for the alt content found in the `vision` area:

- **vision.model** – defaults to `gpt-4o-mini`

## Usage

Wherever you see a field or a label with a “sparkle button” (✦) next to it, click it to use the chatGPT api to create content in those fileds based on the system settings prompts/configurations. By default, it automatically creates sparkle buttons for several fields as outlined below. Delete the prompt settings to remove modAI’s sparkle buttons and the generative AI content creation for those fields:

- **longtitle** – often used for the SEO Meta Title manually or with SEO Suite (should be ~70 characters)
- **description** – often used for the SEO Meta Description manually or with SEO Suite (should be ~155 characters)
- **introtext** – aka Summary, this is set to summarize the page content—useful for news/blog landing pages or as a base to generate images or image+ images from (make sure to save first so it has content to pull from)
- **content** – a freeform prompt box allows you to give instructions on the type of content to generate

If you’re not happy with what modAI generates, click the sparkle button or generate buttons again to generate another variation. You can then use the prev/next navigation buttons to go between the options. When you save, it keeps the option shown and discards the rest.

### Adding modAI to other fields and Template Variables (TVs)

The modAI plugin can attach to most default fields (e.g. pagetitle, menutitle) and any TV with a text, textarea, image or image+ TV input in the `modai.res.fields` and `modai.tvs` settings. The field types are handled individually as follows:

- **text inputs** – modAI uses the base prompt and model and directly inputs the content into the field 
- **textarea inputs** – handled the same as text inputs
- **richtext inputs** – handled the same as a textarea input, but you must manually copy/paste the output into the textarea 
- **image inputs** – modAI uses the default image model and sizes and creates the imaegs in the `assets/ai` directory
- **image+ TVs** – handled the same as image inputs, with the addition of being able to use the Vision model for creating alt tag captions from generated images

### Overriding Global Defaults

Each field that you attach modAI to can have settings overrides. This means that you can mix and match which models are used for specific fields, allowing you to optimize for cost or quality depending on your application. For example to use Claude Haiku to generate a (very) creative summary for the `[[*introtext]]` field, you would update/create the following settings:

- `modai.api.claude.key` → `{your API key}`
- `modai.res.introtext.model` → `claude-3-5-haiku-20241022`
- `modai.res.introtext.temperature` → `0.9`

If you have a blank field option, it will remove the global defaults from being used.

For a list of valid modesl for OpenAI’s ChatGPT, see https://platform.openai.com/docs/models

For a list of valid models for Google Gemini, see https://ai.google.dev/gemini-api/docs/models/gemini

For a list of valid models for Anthropic’s Claude, see https://docs.anthropic.com/en/docs/about-claude/models 

### Using Custom Services/Models

Some services like [Open WebUI](https://docs.openwebui.com) provide a wrapper for multiple models. To use a custom model via these services you need to fill out the `modai.api.custom.url`, `modai.api.custom.key` and optionally the `modai.custom.compatibility`, which tells the model what API emulation to use (almost alway leave this as openai).

To use a model you can either set it globally, or override it on a per-prompt basis, prefixed with `custom_`. For example to have a custom model used, you would create/update settings as follows:

- `modai.api.custom.url` → `{your custom URL}`
- `modai.api.custom.key` → `{your API key}`

Then, you could set an override for a particular field as show above, or even replace the global default with another model:

- `modapi.global.model` → `custom_qwen2.5-coder:1.5b-base`

## Supported ChatGPT Models

For details on current ChatGPT models supported, consult their documentation: 

- **text generation** – https://platform.openai.com/docs/guides/text-generation
- **image to text** – https://platform.openai.com/docs/guides/vision
- **DALL-E image creation** – https://platform.openai.com/docs/guides/images.

## Costs

**OpenAI API credits must be purchased for this Extra to work with Image models.** Find costs for the various models at https://openai.com/api/pricing/.

Google Gemini offeres a variety of free options with limits: https://ai.google.dev/pricing

Anthropic’s API pricing is here: https://www.anthropic.com/pricing#anthropic-api 

To learn more about maanging cost, make sure to use the most optimal models for the type of content you expect your prompts to generate. For example, [1000 tokes is roughly equal to 750 words](https://platform.openai.com/docs/guides/production-best-practices#text-generation); make sure the [model you choose](https://platform.openai.com/docs/guides/model-selection) is the right one for the job at hand.
