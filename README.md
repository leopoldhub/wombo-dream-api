# wombo-dream-api [![License][license-image]][license-url] [![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-downloads-url]

Unofficial API for [Wombo Dream](https://app.wombo.art)

<p style="color: lime;">❤ Feel free to contribute to the project ❤ </p>

## Changelog

> ### 0.1.5
>
> - Can now fetch tasks shop url
> - Can now save, fetch, fetch all and delete tasks in the gallery

> ### 0.1.4-fix
>
> - Throw error when task generation fails
> - uploaded images **MUST** be jpg/jpeg

> ### 0.1.4
>
> - Using **typedoc** to generate **[Documentation][documentation-url]**
> - Updating **[Documentation][documentation-url]**

## Installation

### node.js

    npm install wombo-dream-api

> Please read the
> **[Documentation][documentation-url]**
> to learn more about the api.

## Examples

### Generate a picture

```javascript
const WomboDreamApi = require('wombo-dream-api');

WomboDreamApi.buildDefaultInstance()
	.generatePicture('kitten', 10, (task) => {
		console.log(task.state, 'stage', task.photo_url_list.length);
	})
	.then((task) => console.log(task?.result.final))
	.catch(console.error);
```

### Generate a picture based on an image

```javascript
const WomboDreamApi = require('wombo-dream-api');
const fs = require('fs');

const instance = WomboDreamApi.buildDefaultInstance();

instance
	.uploadImage(fs.readFileSync('./image.jpg'))
	.then((uploadedImageInfo) => {
		instance
			.generatePicture(
				'kitten',
				10,
				(task) => {
					console.log(task.state, 'stage', task.photo_url_list.length);
				},
				{
					mediastore_id: uploadedImageInfo.id,
					weight: 'HIGH',
				}
			)
			.then((task) => console.log(task?.result.final))
			.catch(console.error);
	})
	.catch(console.error);
```

### Fetch styles

```javascript
const WomboDreamApi = require('wombo-dream-api');

WomboDreamApi.buildDefaultInstance()
	.fetchStyles()
	.then((styles) => console.log(styles))
	.catch(console.error);
```

> More examples can be found in the **[Documentation][documentation-url]**

## License

[MIT](LICENSE)

[documentation-url]: https://leopoldhub.github.io/wombo-dream-api/
[license-image]: https://img.shields.io/github/license/leopoldhub/wombo-dream-api.svg
[license-url]: https://github.com/leopoldhub/wombo-dream-api/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/wombo-dream-api.svg
[npm-url]: https://www.npmjs.com/package/wombo-dream-api
[npm-downloads-image]: https://img.shields.io/npm/dm/wombo-dream-api.svg
[npm-downloads-url]: https://www.npmjs.com/package/wombo-dream-api
