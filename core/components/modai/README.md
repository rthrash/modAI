# modAI
A proof of concept Extras to auto-create SEO-related content including page titles, meta titles, meta descriptions, page summaries, and images/alt text that can be used for Open Graph sharing images or hero sections of pages.

The Plugin adds a magician’s wand emoji symbol (🪄) next to various field labels in the back-end Manager. When clicked, it should:

- use prompts based on the type of content being created, 
- use the ChatGPT API to create said content, and 
- dumps the result into the appropriate field. 

## Requirements

- MODX Revolution 3.x
- A chatGPT API key and credits for the API found at https://platform.openai.com/api-keys

This works well with the following Extras, though they’re not required:

- image+ – https://extras.modx.com/package/imageplustvinput
- pThumb – https://extras.modx.com/package/pthumb (don't forget to disable the phpThumbOfCacheManager plugin … it’s evil)

## Configuration

After installing the Extra, update the `modai.chatgpt_key` (filter by the `modai` namespace) with your ChatGPT API key from 

You can customize the prompts and configurations in the global, image, prompt and vision areas of the `modai` namespace in the system settings.

**Note:** modAI also works with SEO Suite, which uses the longtitle and description fields (see below). It also supports image+ for things like Open Graph sharing preview images, hero section images, etc. 

The `modai.prompt.base` can be used for **{INSERT DESCRIPTION HERE}**

If you wish to override a model or model configuration for a specific field, or to attach to additional fields, you do so by creating a system setting in the format of `modai.prompt.{field}`, where field is any of the built in fields in MODX. You can also attach modAI to Template Variables (TVs) with input options of text, textarea or image TVs. It will always attach to Image+ TVs, with support for the alt attribute generation. **[TODO: confirm TVs]**

## Usage

Wherever you see a 🪄, you can click it to call the chatGPT api to create content in those fileds. It will automatically attach that behavior to several fields defined below. You can delete the prompt settings below to remove modAI from generative AI content creation:

- pagetitle – sometimes used for an H1 tag (~60 characters)
- longtitle – often used for the SEO Meta Title (should be ~70 characters)
- description – often used for the SEO Meta Description (should be ~155 characters)
- introtext – aka Summary, this is used to create a brief summary of the page content field and used to generate images
- image+ Image fields – it will use the introtext/summary as a default prompt which can be overwritten before requesting an image generation. It also uses the vision API to create 120 character alt tag descriptions if enabled for your Image+ TVs.

If you’re not happy with what it generates, click the icon again to generate another variation. You can then use the small arrows to go between the options. When you save, it keeps the option shown and discards the rest.

For details on current models supported, consult the documentation at https://platform.openai.com/docs/models, https://platform.openai.com/docs/guides/text-generation, https://platform.openai.com/docs/guides/vision, and https://platform.openai.com/docs/guides/images.

## Costs

OpenAI API credits must be purchased for this Extra to work. You can find costs for the various models at https://openai.com/api/pricing/.

To learn more about maanging cost, make sure to use the most optimal models for the type of content you expect your prompts to generate. For example, [1000 tokes is roughly equal to 750 words](https://platform.openai.com/docs/guides/production-best-practices#text-generation); make sure the [model you choose](https://platform.openai.com/docs/guides/model-selection) is the right one for the job at hand.