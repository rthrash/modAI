# Overview

Use the [Supported Providers](Supported-Providers.md) section to set up your response provider's credentials.

## Generative Fields

The default fields modAI enables in the `modai.res.fields` setting are longtitle, description, introtext/summary, and content. You can add additional standard resource fields to this setting.

### Adding Generative Template Variables

If you have text, textarea, image or image+ Template Variables you wish to use with modAI, add their names to the `modai.tvs` setting.

- **text inputs** – modAI uses the base prompt and model and directly inputs the content into the field
- **textarea inputs** – handled the same as text inputs
- **richtext inputs** – handled the same as a textarea input, but you must manually copy/paste the output into the textarea
- **image inputs** – modAI uses the default image model and sizes and creates the imaegs in the `assets/ai` directory
- **image+ TVs** – handled the same as image inputs, with the addition of being able to use the Vision model for creating alt tag captions from generated images


### Configuring Field Prompts

Customize the base prompts and configurations in the `global`, `image`, `resources` and `vision` areas in the system settings as needed. The `modai.global.base.prompt` prepends the base to ever other text or textarea prompt, but it does not for image or vision model prompts.

## Settings Format

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

### Overriding Global Defaults

Each field that you attach modAI to can have settings overrides. This means that you can mix and match which models are used for specific fields, allowing you to optimize for cost or quality depending on your application. For example to use Claude Haiku to generate a (very) creative summary for the `[[*introtext]]` field, you would update/create the following settings:

- `modai.api.claude.key` → `{your API key}`
- `modai.res.introtext.model` → `claude-3-5-haiku-20241022`
- `modai.res.introtext.temperature` → `0.9`
