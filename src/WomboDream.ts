import axios, {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosRequestHeaders,
} from 'axios';
import { sprintf } from 'sprintf-js';
import sleep from 'sleep-promise';
import GoogleAuthentifier from './GoogleAuthentifier';
import { SavedTask, Task, TaskImageInputSpec, UploadResource } from './types';
import { Style } from 'util';

export const DEFAULT_DISPLAY_FREQ = 10;
export const DEFAULT_CHECK_FREQ = 1000;

export class WomboDream {
	constructor(
		public authentifier: GoogleAuthentifier,
		public apiTaskUrl: string,
		public apiUserSuffix: string,
		public apiTaskSuffix: string,
		public apiShopSuffix: string,
		public apiStyleSuffix: string,
		public apiGallerySuffix: string,
		public originUrl: string,
		public uploadUrl: string
	) {}

	buildApiTaskUrl(taskId: string): string {
		return sprintf(this.apiTaskUrl, {
			suffix: sprintf(this.apiTaskSuffix, { taskId }),
		});
	}

	buildRawApiTaskUrl(): string {
		return this.buildApiTaskUrl('');
	}

	buildUploadUrl(): string {
		return this.uploadUrl;
	}

	buildApiStyleUrl(): string {
		return sprintf(this.apiTaskUrl, {
			suffix: this.apiStyleSuffix,
		});
	}

	buildApiTaskShopUrl(taskId: string): string {
		return sprintf(this.apiTaskUrl, {
			suffix: sprintf(this.apiShopSuffix, { taskId }),
		});
	}

	buildApiGalleryUrl(taskId: string): string {
		return sprintf(this.apiTaskUrl, {
			suffix: sprintf(this.apiGallerySuffix, { taskId }),
		});
	}

	buildRawApiGalleryUrl(): string {
		return this.buildApiGalleryUrl('');
	}

	/**
	 * Create a new HTTP request agent with custom headers for dream API
	 * @example
	 * ```ts
	 * const agent = await dreamInstance.buildHttpRequestAgentForDreamApi();
	 * agent.get('https://app.wombo.art').then(res => console.log(res.data));
	 * ```
	 */
	async buildHttpRequestAgentForDreamApi(): Promise<AxiosInstance> {
		return this.buildHttpRequestAgent({
			baseURL: this.buildRawApiTaskUrl(),
			headers: {
				Origin: this.originUrl,
				Referer: this.originUrl,
				Authorization: `Bearer ${await this.authentifier.obtainAuthorisationToken()}`,
				service: 'Dream',
			},
		});
	}

	/**
	 * Create a new HTTP request agent with custom headers for user API
	 * @example
	 * ```ts
	 * const agent = await dreamInstance.buildHttpRequestAgentForApiUser();
	 * agent.post('https://app.wombo.art/api/users', {username: "myusername"}).then(res => console.log(res.data));
	 * ```
	 */
	async buildHttpRequestAgentForUserAPI(): Promise<AxiosInstance> {
		return this.buildHttpRequestAgent({
			baseURL: this.originUrl,
			headers: {
				Origin: this.originUrl,
				Referer: this.originUrl + '/',
				Authorization: `bearer ${await this.authentifier.obtainAuthorisationToken()}`,
			},
		});
	}

	/**
	 * Create a new HTTP request agent with custom headers
	 * @example
	 * ```ts
	 * const agent = await dreamInstance.buildHttpRequestAgentForApiUser({baseURL: "https://app.wombo.art", headers: {Authorization: "Bearer 12345"}});
	 * agent.get('https://app.wombo.art').then(res => console.log(res.data));
	 * ```
	 */
	async buildHttpRequestAgent(
		config: AxiosRequestConfig<any>
	): Promise<AxiosInstance> {
		try {
			const requestAgent = axios.create(config);
			return requestAgent;
		} catch (error) {
			throw { reason: 'Failed to create request agent', error };
		}
	}

	/**
	 * Initialize new Task
	 *
	 * The Task wont start until it is configured
	 *
	 * @example
	 * ```ts
	 * dreamInstance.initTask().then(console.log);
	 * ```
	 */
	async initTask(): Promise<Task> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const initializedTask = await requestAgent.post(
				this.buildRawApiTaskUrl(),
				{}
			);
			return initializedTask.data;
		} catch (error) {
			throw {
				reason: 'Failed to initialize task',
				error,
			};
		}
	}

	/**
	 * Configure an existing Task
	 *
	 * @param input_image use an image as input
	 * @param display_freq how often the task makes intermediate renders
	 *
	 * @warning must be done with the same account as the task was created
	 *
	 * @example
	 * ```ts
	 * const task:Task;
	 * dreamInstance.configureTask(task, "kitten", 34).then(console.log);
	 * ```
	 */
	async configureTask(
		task: Task,
		prompt: string,
		style: number,
		input_image?: TaskImageInputSpec,
		display_freq: number = DEFAULT_DISPLAY_FREQ
	): Promise<Task> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const configuredTask = await requestAgent.put(
				this.buildApiTaskUrl(task.id),
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
			return configuredTask.data;
		} catch (error) {
			throw {
				reason: 'Failed to configure task',
				error,
			};
		}
	}

	/**
	 * Create and configure an existing Task
	 *
	 * @param input_image use an image as input
	 * @param display_freq how often the task makes intermediate renders
	 *
	 * @example
	 * ```ts
	 * dreamInstance.createTask("kitten", 34).then(console.log);
	 * ```
	 */
	async createTask(
		prompt: string,
		style: number,
		input_image?: TaskImageInputSpec,
		display_freq: number = DEFAULT_DISPLAY_FREQ
	): Promise<Task> {
		try {
			const initializedTask = await this.initTask();

			const configuredTask = await this.configureTask(
				initializedTask,
				prompt,
				style,
				input_image,
				display_freq
			);

			return configuredTask;
		} catch (error) {
			throw {
				reason: 'Failed to create task',
				error,
			};
		}
	}

	/**
	 * Fetch the current infos of a Task
	 *
	 * @warning must be done with the same account as the task was created
	 *
	 * @example
	 * ```ts
	 * const taskId:string;
	 * dreamInstance.fetchTaskInfos(taskId).then(console.log);
	 * ```
	 */
	async fetchTaskInfos(taskId: string): Promise<Task> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const task = await requestAgent.get(this.buildApiTaskUrl(taskId));
			return task.data;
		} catch (error) {
			throw { reason: 'Failed to fetch task info', error };
		}
	}

	/**
	 * Create a new task and generate a picture
	 *
	 * @param progressCallback a callback function that will be called with the progress of the Task
	 * @param input_image use an image as input
	 * @param display_freq how often the task makes intermediate renders
	 *
	 * @example
	 * ```ts
	 * dreamInstance.generatePicture('kitten', 34, (task) => {
	 *			console.log(task.state, 'stage', task.photo_url_list.length);
	 *		})
	 *		.then((task) => console.log(task?.result.final))
	 *		.catch(console.error);
	 * ```
	 */
	async generatePicture(
		prompt: string,
		style: number,
		progressCallback: (task: Task) => void = () => {},
		input_image?: TaskImageInputSpec,
		checkFrequency: number = DEFAULT_CHECK_FREQ,
		display_freq: number = DEFAULT_DISPLAY_FREQ
	): Promise<Task> {
		let task = await this.createTask(prompt, style, input_image, display_freq);

		try {
			while (task.state !== 'completed') {
				task = await this.fetchTaskInfos(task.id);
				progressCallback(task);
				if (task.state === 'failed') throw new Error();
				await sleep(checkFrequency);
			}
			return task;
		} catch (error) {
			progressCallback({ ...task, state: 'failed' });
			throw {
				reason: 'Failed to generate picture',
				error,
			};
		}
	}

	/**
	 * Upload an image for later use
	 *
	 * @warning jpg/jpeg are the only supported image formats
	 *
	 * @example
	 * ```ts
	 * dreamInstance.uploadImage(fs.readFileSync('./image.jpg')).then(console.log);
	 * ```
	 */
	async uploadImage(bufferedImage: Buffer): Promise<UploadResource> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();

		try {
			const resourceUploadInfos: UploadResource = (
				await requestAgent.post(this.buildUploadUrl(), {
					media_expiry: 'HOURS_72',
					media_suffix: 'jpeg',
					num_uploads: 1,
				})
			).data?.shift();

			await requestAgent.put(resourceUploadInfos.media_url, bufferedImage, {
				headers: {
					'Content-Type': 'image/jpeg',
					'Content-Length': bufferedImage.length,
				},
			});

			return resourceUploadInfos;
		} catch (error) {
			throw {
				reason: 'Failed to upload image',
				error,
			};
		}
	}

	/**
	 * Fetch all available styles
	 *
	 * @example
	 * ```ts
	 * dreamInstance.fetchStyles().then(console.log);
	 * ```
	 */
	async fetchStyles(): Promise<Array<Style>> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const styles = await requestAgent.get(this.buildApiStyleUrl());
			return styles.data;
		} catch (error) {
			throw { reason: 'Failed to fetch styles', error };
		}
	}

	/**
	 * Fetch shop url from task id
	 *
	 * @warning must be done with the same account as the task was created
	 *
	 * @example
	 * ```ts
	 * const taskId:string;
	 * dreamInstance.fetchTaskShopUrl(taskId).then(console.log);
	 * ```
	 */
	async fetchTaskShopUrl(taskId: string): Promise<String> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const taskShopUrl = await requestAgent.get(
				this.buildApiTaskShopUrl(taskId)
			);
			return taskShopUrl.data.url;
		} catch (error) {
			throw { reason: 'Failed to fetch task shop url', error };
		}
	}

	/**
	 * Save task to the gallery
	 *
	 * @warning must be done with the same account as the task was created
	 * @warning you must be logged as a user to use it
	 *
	 * @example
	 * ```ts
	 * const taskId:string;
	 * dreamInstance.saveTaskToGallery(taskId, "wonderful kitty").then(console.log);
	 * ```
	 */
	async saveTaskToGallery(
		taskId: string,
		name: string = '',
		isPublic: boolean = false,
		isPromptVisible: boolean = true
	): Promise<SavedTask> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const savedTask = await requestAgent.post(this.buildRawApiGalleryUrl(), {
				task_id: taskId,
				name,
				is_public: isPublic,
				is_prompt_visible: isPromptVisible,
			});

			return savedTask.data;
		} catch (error) {
			throw { reason: 'Failed to save task to gallery', error };
		}
	}

	/**
	 * Fetch a gallery saved task
	 *
	 * @warning task_id != task_gallery_id
	 * @warning you must be logged as a user to use it
	 *
	 * @example
	 * ```ts
	 * const taskGalleryId:number;
	 * dreamInstance.fetchGalleryTask(taskGalleryId).then(console.log);
	 * ```
	 */
	async fetchGalleryTask(taskGalleryId: number): Promise<SavedTask> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const galleryTask = await requestAgent.get(
				this.buildApiGalleryUrl(`${taskGalleryId}`)
			);
			return galleryTask.data;
		} catch (error) {
			throw { reason: 'Failed to fetch gallery task', error };
		}
	}

	/**
	 * Fetch gallery saved tasks
	 *
	 * @warning you must be logged as a user to use it
	 *
	 * @example
	 * ```ts
	 * dreamInstance.fetchGalleryTasks().then(console.log);
	 * ```
	 */
	async fetchGalleryTasks(): Promise<Array<SavedTask>> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const galleryTask = await requestAgent.get(this.buildRawApiGalleryUrl());
			return galleryTask.data.items;
		} catch (error) {
			throw { reason: 'failed to fetch gallery tasks', error };
		}
	}

	/**
	 * Fetch a gallery saved task
	 *
	 * @warning task_id != task_gallery_id
	 * @warning you must be logged as a user to use it
	 *
	 * @example
	 * ```ts
	 * const taskGalleryId:number;
	 * dreamInstance.deleteGalleryTask(taskGalleryId);
	 * ```
	 */
	async deleteGalleryTask(taskGalleryId: number): Promise<void> {
		const requestAgent = await this.buildHttpRequestAgentForDreamApi();
		try {
			const galleryTask = await requestAgent.delete(
				this.buildApiGalleryUrl(`${taskGalleryId}`)
			);
			return galleryTask.data;
		} catch (error) {
			throw { reason: 'Failed to delete gallery task', error };
		}
	}

	/**
	 * Set account username
	 *
	 * @warning YOU NEED TO SET A USERNAME TO INTERRACT WITH GALLERY
	 *
	 * @example
	 * ```ts
	 * dreamInstance.setUsername("myusername");
	 * ```
	 */
	async setUsername(username: string): Promise<void> {
		const requestAgent = await this.buildHttpRequestAgentForUserAPI();
		let user;
		try {
			user = await requestAgent.post(this.apiUserSuffix, {
				username: username,
			});
			return user.data;
		} catch (error) {
			throw { reason: 'Failed to set username', error };
		}
	}
}

export default WomboDream;
