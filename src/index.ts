import WomboDream from './WomboDream';
import GoogleAuthentifier from './GoogleAuthentifier';

export const DEFAULT_ORIGIN_URL = 'https://app.wombo.art';
export const DEFAULT_TASK_API_URL = 'https://paint.api.wombo.ai/api/%(suffix)s';
export const DEFAULT_TASK_API_SUFFIX = 'tasks/%(taskId)s';
export const DEFAULT_SHOP_API_SUFFIX = 'shop/%(taskId)s';
export const DEFAULT_STYLE_API_SUFFIX = 'styles/';
export const DEFAULT_GALLERY_API_SUFFIX = 'gallery/%(taskId)s';
export const DEFAULT_UPLOAD_URL = 'https://mediastore.api.wombo.ai/io/';
export const DEFAULT_AUTHENTIFICATION_KEY =
	'AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw';

export * as WomboDream from './WomboDream';
export * as GoogleAuthentifier from './GoogleAuthentifier';

export const buildDefaultInstance = (email?: string, password?: string) => {
	const wombo = new WomboDream(
		new GoogleAuthentifier(DEFAULT_AUTHENTIFICATION_KEY, email, password),
		DEFAULT_TASK_API_URL,
		DEFAULT_TASK_API_SUFFIX,
		DEFAULT_SHOP_API_SUFFIX,
		DEFAULT_STYLE_API_SUFFIX,
		DEFAULT_GALLERY_API_SUFFIX,
		DEFAULT_ORIGIN_URL,
		DEFAULT_UPLOAD_URL
	);
	return wombo;
};

export * as Types from './types';
