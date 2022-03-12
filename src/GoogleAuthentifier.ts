import axios from "axios";
import { sprintf } from "sprintf-js";
import Authentifier from "./Authentifier";

export type AuthorisationCache = {
	token?: string;
	expiration: number;
};

class GoogleAuthentifier extends Authentifier {
	private authorisationUrlTemplate =
		"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=%(key)s";

	private secret_key: string;

	private authorisationDataCache: AuthorisationCache = {
		token: undefined,
		expiration: 0,
	};

	constructor(secret_key: string) {
		super();
		this.secret_key = secret_key;
	}

	buildAuthorisationUrl(): string {
		return sprintf(this.authorisationUrlTemplate, { key: this.secret_key });
	}

	async fetchAuthorisationData(): Promise<AuthorisationCache> {
		return new Promise(async (resolve, reject) => {
			axios
				.post(this.buildAuthorisationUrl(), { key: this.secret_key })
				.then((res) => {
					resolve({
						token: res.data.idToken,
						expiration: new Date().getTime() + +res.data.expiresIn * 1000,
					});
				})
				.catch(reject);
		});
	}

	async obtainAuthorisationToken(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.ensureCacheValidity();
				resolve(this.authorisationDataCache.token!);
			} catch (error) {
				reject(error);
			}
		});
	}

	async ensureCacheValidity(): Promise<void> {
		//TODO: use refresh token instead of re-authenticating if possible
		this.authorisationDataCache = this.isCacheValid()
			? this.authorisationDataCache
			: await this.fetchAuthorisationData();
	}

	isCacheValid(): boolean {
		return this.authorisationDataCache.expiration > Date.now();
	}
}

export default GoogleAuthentifier;
