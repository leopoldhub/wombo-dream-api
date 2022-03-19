export type TaskImageInputSpec = {
	mediastore_id: string;
	weight: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type TaskInputSpec = {
	style: number;
	prompt: string;
	display_freq?: number;
	input_image?: TaskImageInputSpec;
};

export type Task = {
	id: string;
	user_id: string;
	input_spec: TaskInputSpec | null;
	state: 'input' | 'generating' | 'completed' | 'failed';
	premium: boolean;
	created_at: string;
	updated_at: string;
	photo_url_list: Array<string>;
	generated_photo_keys: Array<string>;
	result: {
		final: string;
	} | null;
};

export type SavedTask = {
	id: number;
	user_id: string;
	task_id: string;
	image_url: string;
	is_public: boolean;
	name: string;
	prompt: string;
	prompt_visible: boolean;
	result: {
		final: string;
	};
	tradingcard_url: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

export type Style = {
	id: number;
	name: string;
	is_visible: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	photo_url: string;
};

export type UploadResource = {
	id: string;
	media_url: string;
	created_at: string;
	expiry_at: string;
};

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
