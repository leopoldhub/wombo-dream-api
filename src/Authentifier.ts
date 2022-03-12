class Authentifier {
	constructor() {
		if (this.constructor === Authentifier) {
			throw new Error("Cannot instantiate abstract class Authentificator");
		}
	}

	async obtainAuthorisationToken(): Promise<string> {
		throw new Error("Method not implemented");
	}
}

export default Authentifier;
