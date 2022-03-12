import WomboDream from "./WomboDream";
import Authentifier from "./Authentifier";
import GoogleAuthentifier from "./GoogleAuthentifier";

const DEFAULT_ORIGIN_URL = "https://app.wombo.art";
const DEFAULT_API_URL = "https://paint.api.wombo.ai/api/tasks/%(taskId)s";
const DEFAULT_AUTHENTIFICATION_KEY = "AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw";

const buildDefaultInstance = () => {
	const wombo = new WomboDream(
		new GoogleAuthentifier(DEFAULT_AUTHENTIFICATION_KEY),
		DEFAULT_API_URL,
		DEFAULT_ORIGIN_URL
	);
	return wombo;
};

export = {
	WomboDream,
	Authentifier,
	GoogleAuthentifier,
	DEFAULT_API_URL,
	DEFAULT_ORIGIN_URL,
	DEFAULT_AUTHENTIFICATION_KEY,
	buildDefaultInstance,
};
