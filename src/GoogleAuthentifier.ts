import axios from 'axios';
import { sprintf } from 'sprintf-js';
import { AuthorisationCache, CredentialsBody } from './types';

export class GoogleAuthentifier {
	public signUpUserUrlTemplate =
		'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=%(key)s';

	public signInUserUrlTemplate =
		'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=%(key)s';

	public tokenRefreshUrlTemplate =
		'https://securetoken.googleapis.com/v1/token?key=%(key)s';

	public authorisationDataCache: AuthorisationCache;

	constructor(
		public secret_key: string,
		public credentials?: CredentialsBody
	) {}

	buildSignUpUserUrl(): string {
		return sprintf(this.signUpUserUrlTemplate, { key: this.secret_key });
	}

	buildTokenRefreshUrl(): string {
		return sprintf(this.tokenRefreshUrlTemplate, { key: this.secret_key });
	}

	buildSignInUserUrl(): string {
		return sprintf(this.signInUserUrlTemplate, { key: this.secret_key });
	}

	/**
	 * Sign up a new user
	 *
	 * @example Sign up as anonymous
	 * ```ts
	 * authentifierInstance.signUp().then(console.log)
	 * ```
	 * @example Sign up as new user
	 * ```ts
	 * authentifierInstance.signUp({
	 * 		email: "my@mail.com",
	 * 		password: "myPassword"
	 * 	}).then(console.log)
	 * ```
	 */
	async signUp(signUpBody?: CredentialsBody): Promise<AuthorisationCache> {
		return new Promise(async (resolve, reject) => {
			axios
				.post(this.buildSignUpUserUrl(), signUpBody)
				.then((res) => {
					resolve(this.setAuthorisationDataCacheFromFetchedData(res.data));
				})
				.catch((error) =>
					reject({ reason: 'Unable to signUp', signUpBody, error })
				);
		});
	}

	/**
	 * Sign in
	 *
	 * @example Sign in with instance credentials
	 *```ts
	 * authentifierInstance.signIn().then(console.log)
	 * ```
	 *
	 * @example Sign in with new credentials
	 * ```ts
	 * authentifierInstance.signIn({
	 * 		email: "my@mail.com",
	 * 		password: "myPassword"
	 * 	}).then(console.log)
	 * ```
	 */
	async signIn(
		signInBody: CredentialsBody = this.credentials!
	): Promise<AuthorisationCache> {
		return new Promise(async (resolve, reject) => {
			axios
				.post(this.buildSignInUserUrl(), {
					...signInBody,
					returnSecureToken: true,
				})
				.then((res) => {
					resolve(this.setAuthorisationDataCacheFromFetchedData(res.data));
				})
				.catch((error) =>
					reject({
						reason: 'Unable to signIn',
						signInBody,
						error,
					})
				);
		});
	}

	/**
	 * Map the fetched data to the AuthorisationCache
	 */
	private setAuthorisationDataCacheFromFetchedData(data: any) {
		return (this.authorisationDataCache = {
			token: data.idToken,
			expirationDate: new Date(new Date().getTime() + +data.expiresIn * 1000),
			refreshToken: data.refreshToken,
		});
	}

	/**
	 * Always obtain a valid authorisation token
	 *
	 * @example
	 * ```ts
	 * authentifierInstance.obtainAuthorisationToken().then(console.log)
	 * ```
	 */
	async obtainAuthorisationToken(): Promise<string> {
		return (await this.ensureCacheValidity())?.token!;
	}

	/**
	 * Refresh the current authorisation token
	 *
	 * @example
	 * ```ts
	 * authentifierInstance.refreshAuthorisationToken().then(console.log)
	 * ```
	 */
	async refreshAuthorisationToken(): Promise<AuthorisationCache> {
		return new Promise(async (resolve, reject) => {
			axios
				.post(this.buildTokenRefreshUrl(), {
					grant_type: 'refresh_token',
					refresh_token: this.authorisationDataCache?.refreshToken,
				})
				.then((res) => {
					resolve(
						this.setAuthorisationDataCacheFromFetchedData({
							idToken: res.data.access_token,
							expiresIn: res.data.expires_in,
							refreshToken: res.data.refresh_token,
						})
					);
				})
				.catch((error) =>
					reject({
						reason: 'Unable to refresh authorisation token',
						refreshToken: this.authorisationDataCache?.refreshToken,
						error,
					})
				);
		});
	}

	/**
	 * Makes sure that the authorisation cache is valid
	 *
	 * @example
	 * ```ts
	 * authentifierInstance.ensureCacheValidity().then(console.log)
	 * ```
	 */
	async ensureCacheValidity(): Promise<AuthorisationCache> {
		if (!this.isCacheValid()) {
			if (this.authorisationDataCache) {
				await this.refreshAuthorisationToken();
			} else {
				if (this.credentials) {
					await this.signIn();
				} else {
					await this.signUp();
				}
			}
		}
		return this.authorisationDataCache;
	}

	/**
	 * Test if the authorisation cache is valid
	 *
	 * @example
	 * ```ts
	 * authentifierInstance.isCacheValid().then(console.log)
	 * ```
	 */
	isCacheValid(): boolean {
		return (
			(this.authorisationDataCache?.expirationDate || Date.now()) > Date.now()
		);
	}
}

export default GoogleAuthentifier;
