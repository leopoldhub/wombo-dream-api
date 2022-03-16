import axios, { AxiosInstance } from 'axios';
import { sprintf } from 'sprintf-js';
import sleep from 'sleep-promise';
import GoogleAuthentifier from './GoogleAuthentifier';

export type TaskImageInputSpec = {
	mediastore_id: string;
	weight: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type TaskSpec = {
	style: number;
	prompt: string;
	display_freq?: number;
	input_image?: TaskImageInputSpec;
};

export type Task = {
	id: string;
	user_id: string;
	input_spec: TaskSpec | null;
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

export const DEFAULT_DISPLAY_FREQ = 10;
export const DEFAULT_CHECK_FREQ = 1000;

class WomboDream {
	constructor(
		public authentifier: GoogleAuthentifier,
		public apiTaskUrl: string,
		public apiStyleUrl: string,
		public originUrl: string,
		public uploadUrl: string
	) {}

	buildApiTaskUrl(taskId: string): string {
		return sprintf(this.apiTaskUrl, { taskId });
	}

	buildRawApiTaskUrl(): string {
		return this.buildApiTaskUrl('');
	}

	buildUploadUrl(): string {
		return this.uploadUrl;
	}

	buildApiStyleUrl(): string {
		return this.apiStyleUrl;
	}

	/**
	 * Create a new request agent with the correct authentication headers
	 * @returns Promise<AxiosInstance>
	 */
	async buildRequestAgent(): Promise<AxiosInstance> {
		return new Promise(async (resolve, reject) => {
			try {
				const authorisationToken =
					await this.authentifier.obtainAuthorisationToken();
				try {
					const requestAgent = axios.create({
						baseURL: this.buildRawApiTaskUrl(),
						headers: {
							Origin: this.originUrl,
							Referer: this.originUrl,
							Authorization: `Bearer ${authorisationToken}`,
							service: 'Dream',
						},
					});
					resolve(requestAgent);
				} catch (error) {
					throw { reason: 'Failed to create request agent', error };
				}
			} catch (error) {
				reject(error);
			}
		});
	}

	async createTask(
		prompt: string,
		style: number,
		input_image?: TaskImageInputSpec,
		display_freq: number = DEFAULT_DISPLAY_FREQ,
		premium: boolean = false
	): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();

				try {
					const createdTask = await requestAgent.post(
						this.buildRawApiTaskUrl(),
						{
							premium,
						}
					);

					const task = await requestAgent.put(
						this.buildApiTaskUrl(createdTask.data.id),
						{
							input_spec: {
								display_freq,
								prompt,
								style,
								input_image,
							},
						},
						{
							headers: {
								'Access-Control-Request-Method': 'PUT',
							},
						}
					);

					resolve(task.data);
				} catch (error) {
					throw {
						reason: 'Failed to initialize task',
						prompt,
						style,
						input_image,
						display_freq,
						premium,
						error,
					};
				}
			} catch (error) {
				reject(error);
			}
		});
	}

	async fetchTaskInfos(taskId: string): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();
				try {
					const task = await requestAgent.get(this.buildApiTaskUrl(taskId));
					resolve(task.data);
				} catch (error) {
					throw { reason: 'Failed to fetch task info', taskId, error };
				}
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 *
	 * @param prompt the image description
	 * @param style the image style (number) use <code>fetchStyles()</code> to get the style id
	 * @param progressCallback a callback function that will be called with the progress of the task
	 * @param input_image the input image information
	 * @param checkFrequency the frequency in millisecond to check the task status
	 * @param display_freq
	 * @param premium
	 * @returns
	 */
	async generatePicture(
		prompt: string,
		style: number,
		progressCallback: (task: Task) => void = () => {},
		input_image?: TaskImageInputSpec,
		checkFrequency: number = DEFAULT_CHECK_FREQ,
		display_freq: number = DEFAULT_DISPLAY_FREQ,
		premium: boolean = false
	): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				let task = await this.createTask(
					prompt,
					style,
					input_image,
					display_freq,
					premium
				);

				try {
					while (!task.result?.final) {
						task = await this.fetchTaskInfos(task.id);
						progressCallback(task);
						await sleep(checkFrequency);
					}
					resolve(task);
				} catch (error) {
					progressCallback({ ...task, state: 'failed' });
					throw {
						reason: 'Failed to generate picture',
						prompt,
						style,
						progressCallback,
						checkFrequency,
						display_freq,
						input_image,
						error,
					};
				}
			} catch (error) {
				reject(error);
			}
		});
	}

	async uploadImage(bufferedImage: Buffer): Promise<UploadResource> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();

				try {
					const resourceUploadInfos: UploadResource = (
						await requestAgent.post(
							this.buildUploadUrl(),
							{
								media_expiry: 'HOURS_72',
								media_suffix: 'jpeg',
								num_uploads: 1,
							},
							{
								headers: {
									service: 'Dream',
								},
							}
						)
					).data?.shift();

					await requestAgent.put(resourceUploadInfos.media_url, bufferedImage, {
						headers: {
							'Content-Type': 'image/jpeg',
							'Content-Length': bufferedImage.length,
						},
					});

					resolve(resourceUploadInfos);
				} catch (error) {
					throw {
						reason: 'Failed to upload image',
						error,
					};
				}
			} catch (error) {
				reject(error);
			}
		});
	}

	async fetchStyles(): Promise<Array<Style>> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();
				try {
					const styles = await requestAgent.get(this.buildApiStyleUrl());
					resolve(styles.data);
				} catch (error) {
					throw { reason: 'Failed to fetch styles', error };
				}
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default WomboDream;
