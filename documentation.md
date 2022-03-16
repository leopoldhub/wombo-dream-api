# WomboDream Documentation

<p style="color: lime;">Feel free to contribute to the documentation!</p>

## Summary

- [WomboDream](#wombodream)
  - [buildApiTaskUrl](#buildapitaskurl)
  - [buildRawApiTaskUrl](#buildrawapitaskurl)
  - [buildRequestAgent](#buildrequestagent)
  - [createTask](#createtask)
  - [fetchTaskInfos](#fetchTaskinfos)
  - [generatePicture](#generatepicture)
  - [fetchStyles](#fetchstyles)
- [GoogleAuthentifier](#googleauthentifier)
  - [buildSignUpUserUrl](#buildsignupuserurl)
  - [buildTokenRefreshUrl](#buildtokenrefreshurl)
  - [buildSignInUserUrl](#buildsigninuserurl)
  - [signUp](#signup)
  - [signIn](#signin)
  - [obtainAuthorisationToken](#obtainauthorisationtoken)
  - [refreshAuthorisationToken](#refreshauthorisationtoken)
  - [ensureCacheValidity](#ensurecachevalidity)
  - [isCacheValid](#iscachevalid)

---

## WomboDream

> `WomboDream` is the main class of the library and is used to interact with the picture generation api.

### buildApiTaskUrl

> Build api endpoint url from the instance template.

```ts
buildApiTaskUrl(taskId: string): string
```

> Example:

```js
buildApiTaskUrl('ae6za016-2695-4383-7ba5-fab53e58b7be');
```

`https://paint.api.wombo.ai/api/tasks/ae6za016-2695-4383-7ba5-fab53e58b7be`

### buildRawApiTaskUrl

> Build api endpoint url from the instance template without task id.

```ts
buildRawApiTaskUrl(): string
```

> Example:

```js
buildRawApiTaskUrl();
```

`https://paint.api.wombo.ai/api/tasks/`

### buildRawApiTaskUrl

> Build api endpoint url for media uploading.

```ts
buildUploadUrl(): string
```

> Example:

```js
buildUploadUrl();
```

`https://mediastore.api.wombo.ai/io/`

### buildRequestAgent

> Create a new request agent with the correct authentication headers with the instance information.

```ts
async buildRequestAgent(): Promise<AxiosInstance>
```

> Example:

```js
buildRequestAgent();
agent.then((agent) => {
	console.log(agent);
	agent.get('https://app.wombo.ai/');
});
```

```js
{
	...,
	headers: {
		...,
		Origin: "https://app.wombo.art",
		Referer: "https://app.wombo.art",
		Authorization: "Bearer xxxxxxxxxxxxxxxxxxxxxxx",
		Service: "Dream",
		...
	},
	baseURL: "https://paint.api.wombo.ai/api/tasks/",
	...
}
```

### createTask

> Generate a task from the given parameters.

```ts
async createTask(prompt: string, style: number, input_image?: TaskImageInputSpec, display_freq?: number, premium?: boolean): Promise<Task>
```

> Examples:

```js
createTask(prompt: "kitten", style: 3).then(console.log);
```

```js
{
	id: '384e00ee-bc71-4260-8aab-c475a7f14da1',
	user_id: 'XfLI9hZ5Y8gXWvbieoJlXNvCcR32',
	input_spec: {
		display_freq: 10,
		prompt: 'kitten',
		style: 3,
	},
	state: 'pending',
	premium: false,
	created_at: '2022-03-15T23:41:02.396770+00:00',
	updated_at: '2022-03-15T23:41:02.892364',
	photo_url_list: [],
	generated_photo_keys: [],
	result: null,
}
```

```js
createTask(prompt: "kitten", style: 3, {mediastore_id: "c24c5f97-47de-457a-9f27-922323b22eff", weight: 'HIGH'}).then(console.log);
```

```js
{
	id: '384e00ee-bc71-4260-8aab-c475a7f14da1',
	user_id: 'XfLI9hZ5Y8gXWvbieoJlXNvCcR32',
	input_spec: {
		display_freq: 10,
		prompt: 'kitten',
		style: 3,
		input_image: {
			weight: 'HIGH',
			mediastore_id: '385ca487-6714-48bd-a015-0b8961f75abd',
		},
	},
	state: 'pending',
	premium: false,
	created_at: '2022-03-15T23:41:02.396770+00:00',
	updated_at: '2022-03-15T23:41:02.892364',
	photo_url_list: [],
	generated_photo_keys: [],
	result: null,
}
```

### fetchTaskInfos

> Fetch task information from the given id.

```ts
fetchTaskInfos(taskId: string): Promise<Task>
```

> Example:

```js
fetchTaskInfos('d5f9efc1-2d7c-4e13-9543-be4a508d1d03').then(console.log);
```

```js
{
	id: 'd5f9efc1-2d7c-4e13-9543-be4a508d1d03',
	user_id: 'w8hVba2l1hbETsel4gwFDqMoxXj2',
	input_spec: {
		style: 3,
		prompt: 'kitten',
		display_freq: 10,
	},
	state: 'generating',
	premium: false,
	created_at: '2022-03-15T23:52:30.320655+00:00',
	updated_at: '2022-03-15T23:52:32.446872+00:00',
	photo_url_list: [
		'https://prod-wombo-paint.s3.amazonaws.com/generated/d5f9efc1-2d7c-4e13-9543-be4a508d1d03/0.jpg?AWSAccessKeyId=AKIAWGXQXQ6WCOB7PP5J&Signature=6zvzjO1BMr0UPy9UY%2B6SY1xTF5Q%3D&Expires=1647391954',
	],
	generated_photo_keys: [
		'generated/d5f9efc1-2d7c-4e13-9543-be4a508d1d03/0.jpg',
	],
	result: null,
}
```

### generatePicture

> Generate a picture from the given parameters.
>
> The `progressCallback` is called every time the generating task is fetched.
>
> The returned `Task` is the final result of the generation.

```ts
async generatePicture(prompt: string, style: number, progressCallback?: (task: Task) => void, input_image?: TaskImageInputSpec, checkFrequency?: number, display_freq?: number, premium?: boolean): Promise<Task>
```

> Examples:

```js
generatePicture('kitten', 21, (task) => {
	console.log(task.state, 'stage', task.photo_url_list.length);
}).then((task) => console.log(task?.result.final));
```

```js
generatePicture(
	'kitten',
	21,
	(task) => {
		console.log(task.state, 'stage', task.photo_url_list.length);
	},
	{ mediastore_id: 'c24c5f97-47de-457a-9f27-922323b22eff', weight: 'HIGH' }
).then((task) => console.log(task?.result.final));
```

```
generating stage 0
generating stage 4
generating stage 10
generating stage 13
generating stage 14
generating stage 16
generating stage 17
generating stage 18
generating stage 20
completed stage 21
https://prod-wombo-paint.s3.amazonaws.com/generated/fbcb32c2-1119-46e4-8fd5-797e9b2d69ac/final.jpg?AWSAccessKeyId=AKIAWGXQXQ6WCOB7PP5J&Signature=DMYucir%2FAYhCbM2aer8Ct6GFHt4%3D&Expires=1647392658
```

### uploadImage

> Upload an image to use it for future image generations.

```ts
async uploadImage(bufferedImage: Buffer): Promise<UploadResource>
```

> Example:

```js
uploadImage(fs.readFileSync('./image.jpg')).then(console.log);
```

```js
{
  id: '385ca487-6714-48bd-a015-0b8961f75abd',
  media_url: 'https://d3r7u1fd9rqpsu.cloudfront.net/data_72/385ca487-6714-48bd-a015-0b8961f75abd.jpeg?Expires=1647470685&Signature=u48mJy3A5t0rx6vv5UpDhn-wo1WF2UgZBScU3Rb38L2owmckh6-1dACclQXStKyZAp6ZdpeXy5AacWEu5r6DVGOcNIES~IRcO1UKogRaqKTAYrGnqyG~Gb82CfnAxVfCg4tHMKS5z3W~AQjdIF9pdeJcGu5xf1n3ra02vt2u19~i0uZ1CO-UjLoHn-yq7qzSw3QaL4mwdaFJhfCpZHu67VelYMt2S9Riixadg0LiNiBvG-zvz6Xtll7qOmYMvtfruCeiYHle68Csy8gkudisVllTeE-Wxn5P7zTMkKQfvu9Ls--nFtmvqoCWFzL9vX8NJRmIrebCJsaxOG6KEYD83A__&Key-Pair-Id=K31QTIHFNZAJ0H',
  created_at: '2022-03-16T21:44:45.659979+00:00',
  expiry_at: '2022-03-19T21:44:45.659979+00:00'
}
```

### fetchStyles

> Fetch all available styles.

```ts
async fetchStyles(): Promise<Array<Style>>
```

> Example:

```js
fetchStyles().then((styles) => console.log(styles));
```

```js
[
	{
		id: 21,
		name: 'Psychedelic',
		is_visible: true,
		created_at: '2022-03-08T04:45:45.191477+00:00',
		updated_at: '2022-03-08T04:45:45.191477+00:00',
		deleted_at: null,
		photo_url:
			'https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/lisa.jpg',
	},
	{
		id: 1,
		name: 'Synthwave',
		is_visible: true,
		created_at: '2021-10-11T17:55:51.462768+00:00',
		updated_at: '2021-12-03T00:57:10.269924+00:00',
		deleted_at: null,
		photo_url:
			'https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/synthwave.jpg',
	},
	...
]
```

---

## GoogleAuthentifier

> `GoogleAuthentifier` is a class that helps you to authenticate with Google `identitytoolkit` api.

### buildSignUpUserUrl

> Build a signUp api endpoint url from the instance template.

```ts
buildSignUpUserUrl(): string
```

> Example:

```js
buildSignUpUserUrl();
```

`https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDxCoSRCFvdsYcJalNfBQQfGl0-YycRkdE`

### buildTokenRefreshUrl

> Build a refresh token api endpoint url from the instance template.

```ts
buildTokenRefreshUrl(): string
```

> Example:

```js
buildTokenRefreshUrl();
```

`https://securetoken.googleapis.com/v1/token?key=AIzaSyDxCoSRCFvdsYcJalNfBQQfGl0-YycRkdE`

### buildSignInUserUrl

> Build a signIn api endpoint url from the instance template.

```ts
buildSignInUserUrl(): string
```

> Example:

```js
buildSignInUserUrl();
```

`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDxCoSRCFvdsYcJalNfBQQfGl0-YycRkdE`

### signUp

> Sign up a new user with the given parameters.
>
> `signUpBody` can be empty, in this case, the user will be registered as a guess,
> or you can pass a `signUpBody` with the following fields:
>
> ```ts
> {
>   "email": string,
>   "password": string,
> }
> ```

```ts
async signUp(signUpBody?: CreditentialsBody): Promise<AuthorisationCache>
```

> Example:

```js
signUp();
```

```js
{
	kind: 'identitytoolkit#SignupNewUserResponse',
	idToken: 'xxxxxxxxxxxxxxxxxxxxxxx',
	refreshToken: 'xxxxxxxxxxxxxxxxxxxxxxx',
	expiresIn: '3600',
	localId: 'Io5e1uKnZPh446Dp06H9S1R15xz2',
}
```

### signIn

> Sign in a user with the given parameters.
>
> You must pass `signUpBody` with the following fields:
>
> ```ts
> {
>   "email": string,
>   "password": string,
> }
> ```

```ts
async signIn(signInBody: CreditentialsBody): Promise<AuthorisationCache>
```

> Example:

```js
signIn({
	email: 'my@mail.com',
	password: 'mypassword',
});
```

```js
{
	kind: 'identitytoolkit#SignupNewUserResponse',
	localId: 'Io5e1uKnZPh446Dp06H9S1R15xz2',
	displayName: '',
	email: 'mail1234@mail1234xxxxx.com',
	idToken: 'xxxxxxxxxxxxxxxxxxxxxxx',
	registered: true,
	refreshToken: 'xxxxxxxxxxxxxxxxxxxxxxx',
	expiresIn: '3600',
}
```

### obtainAuthorisationToken

> Retrieve the authorisation token.

```ts
async obtainAuthorisationToken(): Promise<string>
```

> Example:

```js
obtainAuthorisationToken().then(console.log);
```

`xxxxxxxxxxxxxxxxxxxxxxx`

### refreshAuthorisationToken

> Refresh the authorisation token from the cached refresh token.

```ts
async refreshAuthorisationToken(): Promise<AuthorisationCache>
```

> Example:

```js
refreshAuthorisationToken().then(console.log);
```

```javascript
{
  token: "xxxxxxxxxxxxxxxxxxxxxxx",
  expirationDate: 2022-03-16T01:39:06.625Z,
  refreshToken: "xxxxxxxxxxxxxxxxxxxxxx"
}
```

### ensureCacheValidity

> Makes sure that the cached token is valid.

```ts
async ensureCacheValidity(): Promise<AuthorisationCache>
```

> Example:

```js
ensureCacheValidity().then(console.log);
```

```javascript
{
  token: "xxxxxxxxxxxxxxxxxxxxxxx",
  expirationDate: 2022-03-16T01:39:06.625Z,
  refreshToken: "xxxxxxxxxxxxxxxxxxxxxx"
}
```

### isCacheValid

> Returns `true` if the cached token is still valid.

```ts
isCacheValid(): boolean
```

> Example:

```js
isCacheValid();
```

`false`
