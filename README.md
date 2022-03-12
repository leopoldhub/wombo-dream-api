# wombo-dream-api [![License][license-image]][license-url] [![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-downloads-url]

Unofficial API for [Wombo Dream](https://app.wombo.art)

## Installation

### node.js

    npm install wombo-dream-api

## Usage

```javascript
const WomboApi = require("wombo-dream-api");

WomboApi.buildDefaultInstance()
	.generatePicture(10, "kitten", 10, (task) => {
		console.log(task.state, "stage", task.photo_url_list.length);
	})
	.then((task) => console.log(task.result.final))
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
