# wombo-dream-api [![License][license-image]][license-url] [![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-downloads-url]

Unofficial API for [Wombo Dream](https://app.wombo.art)

<p style="color: lime;">❤ Feel free to contribute to the project ❤ </p>

## Upcomming features

- NFT minting
- change of password/username/email/profile picture
- ability to browse other users' profiles

## Changelog

> ### 0.1.6
>
> - Refactoring
> - Documentation updated
> - API testing

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

## Example

```javascript
const { buildDefaultInstance } = require('wombo-dream-api');
const fs = require('fs');

(async () => {
	try {
		const credentials = {
			email: 'mysuperemail@gmail.com',
			password: 'mypassword',
		};

		// signin is automatically done when you interract with the api if you pass credentials
		const wombo = buildDefaultInstance(credentials);

		// if you want to sign up as new user:
		// await wombo.authentifier.signUp(credentials);

		// fetch all styles
		const styles = await wombo.fetchStyles();
		console.log(styles.map((style) => `[${style.id}] ${style.name}`));

		// upload image [ONLY JPEG SUPPORTED]
		const uploadedImage = await wombo.uploadImage(
			fs.readFileSync('./image.jpeg')
		);

		// generate picture from image
		const generatedTask = await wombo.generatePicture(
			'mountain',
			styles[0].id,
			(taskInProgress) => {
				console.log(
					`[${taskInProgress.id}]: ${taskInProgress.state} | step: ${taskInProgress.photo_url_list.length}`
				);
			},
			{ mediastore_id: uploadedImage.id, weight: 'HIGH' }
		);

		console.log(
			`[${generatedTask.id}]: ${generatedTask.state} | final url: ${generatedTask.result?.final}`
		);

		// to interract with the gallery, YOU NEED TO HAVE A USERNAME!
		// if you just created the account and it doesn't have a username, set it with:
		// await wombo.setUsername('myusername');

		// save an image in the gallery
		const savedTask = await wombo.saveTaskToGallery(
			generatedTask.id,
			'my wonderful creation',
			true,
			true
		);

		console.log('image saved!');

		// obtain gallery tasks
		const galleryTasks = await wombo.fetchGalleryTasks();

		console.log(galleryTasks);
	} catch (error) {
		console.error(error);
	}
})();
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
