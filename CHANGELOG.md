# Changelog

All notable changes to this project will be documented in this file.

## 0.9.0-beta - 2025-02-20

### 🚀 Features

- Init the project ([23cc847](23cc847ef629a5b6bf612a1aac511789823d3b72))
- Hook up to pagetitle, longtitle, description and introtext ([89483e8](89483e8c0398ca41c19bf9d2359e84c561c60b15))
- Store current field's value to the history ([2f7add3](2f7add355ee8040e208597d7935e93e3a4b25dbe))
- Generate images ([dbcdd3a](dbcdd3a16e724eec68337b35b3c3f5a8b4dabaab))
- Add quality to image generation and update baseline prompts ([9716dc2](9716dc2207c9d370a8b939216d9405f33e568fef))
- Hide wait msg on failure and show an error message instead ([0421424](0421424c5398502fb3ff54ec63cd449a8398ea5a))
- Adjust UI & add FreeText prompt ([4ed2c92](4ed2c921a6ce8dfc6a733e0b637dd21f2071f144))
- Configurable tvs & resource fields ([8e8ad03](8e8ad0387ce20b1ed66921503a958b9d5f046f7d))
- Add setting for base output ([3d88b08](3d88b080e448786e6f13ff2960afff61fdd772ec))
- Updating area name and consistent cross-browser modAI button styling ([711113d](711113dbfe26a1fd1b6b5dbfdb26d8e6c99940d1))
- Add global.base.output ([77e9379](77e93791e4555b3cac6d55cb3744c63686890641))
- Allow override base.output ([093e371](093e371abe8c3d5ebf63cc887ebc0e6496301791))
- Add support for gemini ([dbc3bd0](dbc3bd046ca8eb0943140199b53d7d727ca6dc31))
- Attach modAI on textareas and rte TVs ([259dd34](259dd34fe62a178aca3945934c3d2dfe543a8388))
- Add support for anthropic models (claude) ([3bea523](3bea523aa380995ea7b7f733f0198a570abb3bd0))
- Consolidate api services ([5150c47](5150c471d1557ee8d7a0df42eab5017979a63837))
- Add support for custom api, compatible with openai ([fb04ee6](fb04ee69404f6e139e12fa56185810408f9d5544))
- Add system setting to configure download path for generated images ([83c14b6](83c14b6a10924c64d01f2ae8da50c6899e69b53e))
- Add support for image generation in gemini models ([83492c9](83492c9d31ee93f65681854bd1ac78753331c132))
- Add vision support for gemini ([2747fa7](2747fa7a62447e7677e7c75b19fbbfc2381bb366))
- Allow model/prompt overriding for vision per field ([94a2414](94a2414aab0c33a5d98b0304b6a4533b2da1159e))
- Move calling AI service to the client side ([7ef59bd](7ef59bd2df8bdead0a07021d68e759574c66cca3))

### 🐛 Bug Fixes

- Add missing import ([90a2f66](90a2f66eab46db6b751a9c955d0ae6526fb19d18))
- Update assetsUrl path ([68780fa](68780fa50b99aa46ce89e3bc4696620a63e43c7c))
- Fix saving altTag ([9e62f83](9e62f839b253cb3c374e12f200e9ef146380dd89)), Resolves #1
- Fix name of global base prompt ([a68bf91](a68bf91862e3ac6f9c4e3678b2848f7448577ae4))
- Fix global base prompt in free text ([faaf61d](faaf61dd172b4d8e674dabbc7d24ae8be41a92ac))
- Fix grabbing chatgpt key ([a173a55](a173a552b94a4158c621fa47c2d48a61efbf5d1d))
- Disable timeout when calling prompt processors ([56b33d8](56b33d84f55019c30c0e768124f88fb582181f33))
- Fix return of generateImage from custom chatgpt integration ([8539f35](8539f350a5d0bbd34eeaed9297c40b4fe959d3a4))
- Use getImageFieldSetting when generating an image ([95f5d90](95f5d90c0a46841e4b176218b681f73fcc4b60c2))

### 📚 Documentation

- More descriptions and initial documentation ([3cefccf](3cefccfbdd7c7ab5708858445f15a41e1087f4c8))
- Document base prompt ([e100400](e1004008f861e804cd8ad49e420fcf4e2f1e5c5b))
- Update README.md ([c2e4e17](c2e4e1779e6760039f8c18b07bd5ca29eab504cb))
- Fixing readme typos and clarifications ([758349f](758349f6aae5b850c00e128f3b6dedcd545e0609))
- Streamline README ([deaee2f](deaee2ff4d098514f56676e5f70dbe942140b783))
- Clarify the README.md even more, because I can't stop ([62ae55d](62ae55df40da60e2fe1c73bb6686834cd4c4d745))
- Update instructions for TV handling + default image to wide ([634e8e0](634e8e0692eaff98861b769e4cff8a2055d9be3c))
- Create LICENSE ([5f24386](5f243867c88772e323766a24d05a11d967055b04))
- Move readme ([d65c986](d65c9863c2ac05c8b3bc96651fd693ff10b82517))
- Documentation updates and Settings names ([808b6d4](808b6d43ed0404eb9981879f2ee3e1c4fc074496))
- Multi-model and custom model usage instructions ([97aa5a0](97aa5a0582ec84d7916d917fdf66ce992fa724f1))
- Fix typos in README ([a89293b](a89293b5d67e0e9dbe4280b3fb05217e50add98e))
- Adjust order and add service specific docs ([0700b38](0700b381c5b22bfea211cd58d2d3aae0ea31459c))
- Add Gemini Image + Vision ([709bd5d](709bd5dada62dd6bcd21bb3ba0c9425ad30ba60c))
- Convert readme to writerside ([fb240bd](fb240bda15c5b7b24f86136acf27339ccbbecd58))
- Set docs to build while in private mode ([e2ccdc7](e2ccdc75f7fd9338654392e51775841c4442c4ce))
- Fix link to docs and add theme ([a13cdc0](a13cdc08ab794aed10a753ee37e0ab439b930043))

### 🎨 Styling

- CSS for nav buttons ([e116c94](e116c943150487bb86cb800698ef6dafa898bb4e))
- Make buttons great again ([76a1f04](76a1f04ce75b45521e9ccb14e638696651fa7126))
- Initial tweaks for Image+ alt button (still need 3px or so top margin) ([ed89a1d](ed89a1d39fcbb63f11064427f9f6d2f1dfd7ee92))
- Fix for minor alignment on alt text icon ([1f3afb6](1f3afb67b72a4a3e0934177e2e060261ac42e359))
- Adjust AI button look ([e7e4929](e7e4929afc7d29797c60c5e39c8bf4192953d7ae))
- Increase height of response textarea in the free text prompt window ([c7533da](c7533daf64644220865de926502cbb6e6fa81bc6))
- Visually simplify button borders ([1b48a84](1b48a84ce5b590584e521c0814ed358b03e0e90e))

### ⚙️ Miscellaneous Tasks

- Version bump ([19fcae4](19fcae4af85a7c24e1f4194db859f376e61c9170))
- Add git-cliff config ([74c2b0d](74c2b0dd29bcad577090b753751e593588b0dea0))
- Add lexicons for system settings ([c00c82e](c00c82ee633e79ec2b81e4d77486a933501999d5))
- Clean up IDs in action ([0c35a59](0c35a59b0790a0e44204005f35550aa26b8a8a0a))
- Convert all text to lexicons ([bd45280](bd452805a79aadeb35e17370bb38f1f4f52ad354))
- Ignore config.core.php file ([222aeab](222aeabbb209da9ef8f8e3efdfaff78f1ff8e3a5))


