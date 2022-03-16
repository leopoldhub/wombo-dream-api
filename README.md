# wombo-dream-api [![License][license-image]][license-url] [![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-downloads-url]

Unofficial API for [Wombo Dream](https://app.wombo.art)

<p style="color: lime;">Feel free to contribute to the project <3</p>

## Changelog

> ### 0.1.3
>
> - Adding image upload
> - Adding image based generation
> - Updating **[Documentation](documentation.md)**

> ### 0.1.2
>
> - Adding **[Documentation](documentation.md)**
> - Adding login
> - Improving authentification token refresh
> - Removing abstract `Authentifier`
> - Massive refactoring (can break code)

> ### 0.1.1-fix
>
> - Adding the possibility to fetch styles

> ### 0.1.0
>
> - Initial release

## Installation

### node.js

    npm install wombo-dream-api

> Please read the
> **[Documentation](documentation.md)**
> to know more about the api.

## Examples

### Generate a picture

```javascript
const WomboDreamApi = require('wombo-dream-api');

WomboDreamApi.buildDefaultInstance()
	.generatePicture(10, 'kitten', 10, (task) => {
		console.log(task.state, 'stage', task.photo_url_list.length);
	})
	.then((task) => console.log(task?.result.final))
	.catch(console.error);
```

### Generate a picture based on an image

```javascript
const WomboDreamApi = require('wombo-dream-api');

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

## License

[MIT](LICENSE)

[license-image]: https://img.shields.io/github/license/leopoldhub/wombo-dream-api.svg
[license-url]: https://github.com/leopoldhub/wombo-dream-api/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/wombo-dream-api.svg
[npm-url]: https://www.npmjs.com/package/wombo-dream-api
[npm-downloads-image]: https://img.shields.io/npm/dm/wombo-dream-api.svg
[npm-downloads-url]: https://www.npmjs.com/package/wombo-dream-api
