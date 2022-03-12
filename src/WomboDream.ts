import axios, { AxiosInstance } from "axios";
import { sprintf } from "sprintf-js";
import sleep from "sleep-promise";
import Authentifier from "./Authentifier";

export type Task = {
	id: string;
	user_id: string;
	input_spec: { style: number; prompt: string; display_freq: number } | null;
	state: "input" | "generating" | "completed";
	premium: boolean;
	created_at: string;
	updated_at: string;
	photo_url_list: Array<string>;
	generated_photo_keys: Array<string>;
	result: {
		final: string;
	} | null;
};

class WomboDream {
	originUrl: string;

	apiUrl: string;

	premium: boolean;

	authentifier: Authentifier;

	constructor(
		authentifier: Authentifier,
		apiUrl: string,
		originUrl: string,
		premium: boolean = false
	) {
		this.authentifier = authentifier;
		this.apiUrl = apiUrl;
		this.originUrl = originUrl;
		this.premium = premium;
	}

	buildApiTaskUrl(taskId: string): string {
		return sprintf(this.apiUrl, { taskId });
	}

	buildRawApiTaskUrl(): string {
		return this.buildApiTaskUrl("");
	}

	async buildRequestAgent(): Promise<AxiosInstance> {
		return new Promise(async (resolve, reject) => {
			try {
				const authorisationToken =
					await this.authentifier.obtainAuthorisationToken();
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
				reject(error);
			}
		});
	}

	async initializeTask(
		display_freq: number,
		prompt: string,
		style: number
	): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();

				const createdTask = await requestAgent.post(this.buildRawApiTaskUrl(), {
					premium: this.premium,
				});

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
							"Access-Control-Request-Method": "PUT",
						},
					}
				);

				resolve(task.data);
			} catch (error) {
				reject(error);
			}
		});
	}

	async fetchTaskInfos(taskId: string): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestAgent = await this.buildRequestAgent();

				const task = await requestAgent.get(this.buildApiTaskUrl(taskId));

				resolve(task.data);
			} catch (error) {
				reject(error);
			}
		});
	}

	async generatePicture(
		display_freq: number,
		prompt: string,
		style: number,
		progressCallback: (task: Task) => void,
		checkFrequency: number = 1000
	): Promise<Task> {
		return new Promise(async (resolve, reject) => {
			try {
				let task = await this.initializeTask(display_freq, prompt, style);

				while (!task.result?.final) {
					task = await this.fetchTaskInfos(task.id);
					progressCallback(task);
					await sleep(checkFrequency);
				}

				resolve(task);
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default WomboDream;
