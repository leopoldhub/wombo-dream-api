import axios from 'axios';
import { sprintf } from 'sprintf-js';

export type AuthorisationCache =
	| {
			token: string;
			expirationDate: Date;
			refreshToken: string;
	  }
	| undefined;

export type CreditentialsBody =
	| {
			email: string;
			password: string;
	  }
	| any;

class GoogleAuthentifier {
	public signUpUserUrlTemplate =
		'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=%(key)s';

	public signInUserUrlTemplate =
		'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=%(key)s';

	public tokenRefreshUrlTemplate =
		'https://securetoken.googleapis.com/v1/token?key=%(key)s';

	public authorisationDataCache: AuthorisationCache;

	constructor(
		public secret_key: string,
		public email?: string,
		public password?: string
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

	async signUp(signUpBody?: CreditentialsBody): Promise<AuthorisationCache> {
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

	async signIn(signInBody: CreditentialsBody): Promise<AuthorisationCache> {
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
					reject({ reason: 'Unable to signIn', signInBody, error })
				);
		});
	}

	private setAuthorisationDataCacheFromFetchedData(data: any) {
		return (this.authorisationDataCache = {
			token: data.idToken,
			expirationDate: new Date(new Date().getTime() + +data.expiresIn * 1000),
			refreshToken: data.refreshToken,
		});
	}

	async obtainAuthorisationToken(): Promise<string> {
		return (await this.ensureCacheValidity())?.token!;
	}

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

	async ensureCacheValidity(): Promise<AuthorisationCache> {
		if (!this.isCacheValid()) {
			if (this.authorisationDataCache) {
				await this.refreshAuthorisationToken();
			} else {
				if (this.email && this.password) {
					await this.signIn({ email: this.email!, password: this.password! });
				} else {
					await this.signUp();
				}
			}
		}
		return this.authorisationDataCache;
	}

	isCacheValid(): boolean {
		return (
			(this.authorisationDataCache?.expirationDate || Date.now()) > Date.now()
		);
	}
}

export default GoogleAuthentifier;
