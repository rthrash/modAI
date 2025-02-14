# modAI
A proof of concept Extra generative AI creation of SEO-related content including page titles, meta titles, meta descriptions, page summaries, and images/alt text that can be used for Open Graph shares or hero sections that are all the rage for the top of web pages.

The Plugin adds a sparkle (✦) button next to fields or labels in the back-end Manager. When clicked, it:

- uses prompts based on the type of content being created, 
- uses the ChatGPT API to create said content, and 
- dumps the result into the appropriate field or a textarea that you can copy/paste from (e.g., for the Content field). 

## Requirements

- MODX Revolution 3.x
- A ChatGPT API key from https://platform.openai.com/api-keys
- Pre-paid credits for API calls—this is different than the $20/month ChatGPT Pro subscription

MODX’s modAI Extra plays very well with the following Extras, though they’re not required:

- **image+** – https://extras.modx.com/package/imageplustvinput
- **pThumb** – https://extras.modx.com/package/pthumb (don't forget to disable the phpThumbOfCacheManager plugin … it’s evil)

## Configuration

After installing the Extra, update the `modai.chatgpt_key`—filter by the `modai` namespace to make it easy to find—with your ChatGPT API key.

You can customize the prompts and configurations in the global, image, prompt and vision areas of the `modai` namespace in the system settings.

**Note:** modAI works with SEO Suite, which uses the `longtitle` and `description` fields (see below). It also supports image+ for things like Open Graph sharing preview images, hero section images, etc. 

The `modai.prompt.base` can be roughly equated to a light version of ChatGPT’s custom instructions: it prepends the base prompt to ever other prompt for your site.

If you wish to override a model or model configuration for a specific field, or to attach to additional fields, you do so by creating a system setting in the format of `modai.prompt.{field}.{setting}` substituting for the relevant `{field}` and `{setting}` as appropriate. 

You can attach modAI to text, textarea or image Template Variables (TVs) using similar settings to the built in fields: `modai.prompt.{tv-name}.{setting}` (setting is optional). It will always attach to Image+ TVs, with support for the alt attribute generation using the vision models to describe the images for you.

## Usage

Wherever you see a field or a label with a “sparkle button” (✦) next to it, click it to use the chatGPT api to create content in those fileds based on the system settings prompts/configurations. By default, it automatically creates sparkle buttons for several fields as outlined below. Delete the prompt settings to remove modAI’s sparkle buttons and generative AI content creation for those fields:

- **pagetitle** – sometimes used for an H1 tag (~60 characters)
- **longtitle** – often used for the SEO Meta Title (should be ~70 characters)
- **description** – often used for the SEO Meta Description (should be ~155 characters)
- **introtext** – aka Summary, this is used to create a brief summary of the page content field and used to generate images
- **image+ TVs** – it will use the introtext/summary as a default prompt which can be overwritten before requesting an image generation. It also uses the vision API to create 120 character alt tag descriptions if enabled for your Image+ TVs.

If you’re not happy with what modAI generates, click the sparkle button or generate buttons again to generate another variation. You can then use the prev/next navigation buttons to go between the options. When you save, it keeps the option shown and discards the rest.

## Supported ChatGPT Models

For details on current ChatGPT models supported, consult their documentation: 

- **text generation** – https://platform.openai.com/docs/guides/text-generation
- **image to text** – https://platform.openai.com/docs/guides/vision
- **DALL-E image creation** – https://platform.openai.com/docs/guides/images.

## Costs

**OpenAI API credits must be purchased for this Extra to work.** Find costs for the various models at https://openai.com/api/pricing/.

To learn more about maanging cost, make sure to use the most optimal models for the type of content you expect your prompts to generate. For example, [1000 tokes is roughly equal to 750 words](https://platform.openai.com/docs/guides/production-best-practices#text-generation); make sure the [model you choose](https://platform.openai.com/docs/guides/model-selection) is the right one for the job at hand.
