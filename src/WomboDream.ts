import axios, { AxiosInstance } from 'axios';
import { sprintf } from 'sprintf-js';
import sleep from 'sleep-promise';
import GoogleAuthentifier from './GoogleAuthentifier';

export type Task = {
	id: string;
	user_id: string;
	input_spec: { style: number; prompt: string; display_freq: number } | null;
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

class WomboDream {
	constructor(
		public authentifier: GoogleAuthentifier,
		public apiUrl: string,
		public originUrl: string,
		public premium: boolean = false
	) {}

	buildApiTaskUrl(taskId: string): string {
		return sprintf(this.apiUrl, { taskId });
	}

	buildRawApiTaskUrl(): string {
		return this.buildApiTaskUrl('');
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
		display_freq: number,
		prompt: string,
		style: number
	): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();

				try {
					const createdTask = await requestAgent.post(
						this.buildRawApiTaskUrl(),
						{
							premium: this.premium,
						}
					);

					const task = await requestAgent.put(
						this.buildApiTaskUrl(createdTask.data.id),
						{
							input_spec: {
								display_freq,
								prompt,
								style,
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
					throw { reason: 'Failed to initialize task', error };
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
	 * @param display_freq
	 * @param prompt the image description
	 * @param style the image style (number) use <code>fetchStyles()</code> to get the style id
	 * @param progressCallback a callback function that will be called with the progress of the task
	 * @param checkFrequency the frequency in milliseconds to check the task status
	 * @returns
	 */
	async generatePicture(
		display_freq: number,
		prompt: string,
		style: number,
		progressCallback: (task: Task) => void,
		checkFrequency: number = 1000
	): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				let task = await this.createTask(display_freq, prompt, style);

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
						display_freq,
						prompt,
						style,
						progressCallback,
						checkFrequency,
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
					const styles = await requestAgent.get(
						'https://paint.api.wombo.ai/api/styles/'
					);

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
