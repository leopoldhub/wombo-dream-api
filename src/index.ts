import WomboDream from './WomboDream';
import GoogleAuthentifier from './GoogleAuthentifier';

const DEFAULT_ORIGIN_URL = 'https://app.wombo.art';
const DEFAULT_API_URL = 'https://paint.api.wombo.ai/api/tasks/%(taskId)s';
const DEFAULT_AUTHENTIFICATION_KEY = 'AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw';

const buildDefaultInstance = (email?: string, password?: string) => {
	const wombo = new WomboDream(
		new GoogleAuthentifier(DEFAULT_AUTHENTIFICATION_KEY, email, password),
		DEFAULT_API_URL,
		DEFAULT_ORIGIN_URL
	);
	return wombo;
};

export = {
	WomboDream,
	GoogleAuthentifier,
	DEFAULT_API_URL,
	DEFAULT_ORIGIN_URL,
	DEFAULT_AUTHENTIFICATION_KEY,
	buildDefaultInstance,
};
