import GoogleAuthentifier from '../src/GoogleAuthentifier';
import { DEFAULT_AUTHENTIFICATION_KEY } from './index';
import { AuthorisationCache } from './types';
import {
	createRandomCredentials,
	createRandomAuthorisationCache,
} from './testUtils';

describe('GoogleAuthentifier', () => {
	describe('signup', () => {
		let anonymousAuthentifier: GoogleAuthentifier;

		beforeAll(() => {
			anonymousAuthentifier = new GoogleAuthentifier(
				DEFAULT_AUTHENTIFICATION_KEY
			);
		});

		it('sould correctly signUp a new user with credentials', async () => {
			const signUpBody = createRandomCredentials();
			const result = await anonymousAuthentifier.signUp(signUpBody);

			expect(result).toBeDefined();
		});

		it('sould correctly signUp a new anonymous user', async () => {
			const result = await anonymousAuthentifier.signUp();

			expect(result).toBeDefined();
		});

		it('sould set authorisation data cache after signup', async () => {
			const signUpBody = createRandomCredentials();
			const result = await anonymousAuthentifier.signUp(signUpBody);

			expect(result).toBeDefined();
			expect(anonymousAuthentifier.authorisationDataCache).toEqual(result);
		});
	});

	describe('signin', () => {
		let authentifier: GoogleAuthentifier;
		const signInBody = createRandomCredentials();

		beforeAll(async () => {
			authentifier = new GoogleAuthentifier(
				DEFAULT_AUTHENTIFICATION_KEY,
				signInBody
			);
			await authentifier.signUp(signInBody);
		});

		it('sould correctly signin a user with instance credentials', async () => {
			const result = await authentifier.signIn();

			expect(result).toBeDefined();
		});

		it('sould correctly signin a user with new credentials', async () => {
			const result = await authentifier.signIn(signInBody);

			expect(result).toBeDefined();
		});

		it('sould set authorisation data cache after signin', async () => {
			const result = await authentifier.signIn(signInBody);

			expect(result).toBeDefined();
			expect(authentifier.authorisationDataCache).toEqual(result);
		});
	});

	describe('refreshAuthorisationToken', () => {
		let authentifier: GoogleAuthentifier;
		const signInBody = createRandomCredentials();

		beforeAll(async () => {
			authentifier = new GoogleAuthentifier(
				DEFAULT_AUTHENTIFICATION_KEY,
				signInBody
			);
			await authentifier.signUp(signInBody);
		});

		it('sould correctly refresh token', async () => {
			const result = await authentifier.refreshAuthorisationToken();

			expect(result).toBeDefined();
		});
	});

	describe('authorisation', () => {
		let authentifier: GoogleAuthentifier;

		beforeEach(() => {
			authentifier = new GoogleAuthentifier(DEFAULT_AUTHENTIFICATION_KEY);
		});

		describe('isCacheValid', () => {
			let fakeDate: Date;
			beforeAll(() => {
				fakeDate = new Date('2022-07-06T17:25:00.000Z');
			});

			it('should return true if cache is valid', async () => {
				jest.useFakeTimers().setSystemTime(fakeDate.getTime() - 1);

				authentifier.authorisationDataCache = {
					expirationDate: fakeDate,
				} as unknown as AuthorisationCache;
				expect(authentifier.isCacheValid()).toBeTruthy();
			});

			it('should return false if cache is not valid', async () => {
				jest.useFakeTimers().setSystemTime(fakeDate.getTime());

				authentifier.authorisationDataCache = {
					expirationDate: fakeDate,
				} as unknown as AuthorisationCache;
				expect(authentifier.isCacheValid()).toBeFalsy();
			});
		});

		describe('ensureCacheValidity', () => {
			let authentifier: GoogleAuthentifier;

			beforeEach(() => {
				authentifier = new GoogleAuthentifier(DEFAULT_AUTHENTIFICATION_KEY);
			});

			it('should return authorisation data cache', async () => {
				authentifier.authorisationDataCache = createRandomAuthorisationCache();
				const isCacheValidSpy = jest
					.spyOn(authentifier, 'isCacheValid')
					.mockReturnValue(true);
				const result = await authentifier.ensureCacheValidity();

				expect(isCacheValidSpy).toHaveBeenCalledTimes(1);
				expect(result).toBeDefined();
				expect(result).toEqual(authentifier.authorisationDataCache);
			});

			it('should call refreshAuthorisationToken when cache is not valid and user is signed in', async () => {
				authentifier.authorisationDataCache = createRandomAuthorisationCache();
				jest.spyOn(authentifier, 'isCacheValid').mockReturnValue(false);
				const refreshAuthorisationTokenSpy = jest
					.spyOn(authentifier, 'refreshAuthorisationToken')
					.mockReturnValue(
						Promise.resolve(authentifier.authorisationDataCache)
					);
				await authentifier.ensureCacheValidity();

				expect(refreshAuthorisationTokenSpy).toHaveBeenCalledTimes(1);
			});

			it('should call signin when cache is not valid, user is not signed in and there is credentials', async () => {
				authentifier.credentials = createRandomCredentials();
				jest.spyOn(authentifier, 'isCacheValid').mockReturnValue(false);
				const signInSpy = jest
					.spyOn(authentifier, 'signIn')
					.mockReturnValue(
						Promise.resolve(authentifier.authorisationDataCache)
					);
				await authentifier.ensureCacheValidity();

				expect(signInSpy).toHaveBeenCalledTimes(1);
			});

			it('should call signup when cache is not valid, user is not signed in and there is no credentials', async () => {
				jest.spyOn(authentifier, 'isCacheValid').mockReturnValue(false);
				const signUpSpy = jest
					.spyOn(authentifier, 'signUp')
					.mockReturnValue(
						Promise.resolve(authentifier.authorisationDataCache)
					);
				await authentifier.ensureCacheValidity();

				expect(signUpSpy).toHaveBeenCalledTimes(1);
			});
		});
	});
});
