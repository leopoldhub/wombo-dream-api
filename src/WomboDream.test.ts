import { buildDefaultInstance } from '.';
import {
	createRandomCredentials,
	createRandomUsername,
	jpegImage,
} from './testUtils';
import { CredentialsBody, Task, TaskImageInputSpec } from './types';
import WomboDream from './WomboDream';

describe('WomboDream', () => {
	let wombo: WomboDream;

	const prompt = 'mountain';
	const style = 34;
	const image: TaskImageInputSpec = {
		mediastore_id: '63c45c5c-735b-4f84-b6bd-8e69f56dc57f',
		weight: 'HIGH',
	};
	const display_freq = 2;

	beforeEach(async () => {
		const credentials: CredentialsBody = createRandomCredentials();
		wombo = buildDefaultInstance(credentials);
		await wombo.authentifier.signUp(credentials);
	});

	describe('buildHttpRequestAgent', () => {
		it('should return a http request agent', () => {
			const agent = wombo.buildHttpRequestAgentForDreamApi();

			expect(agent).toBeDefined();
		});
	});

	describe('initTask', () => {
		it('should return a new empty task', async () => {
			const task = await wombo.initTask();

			expect(task).toBeDefined();
		});
	});

	describe('configureTask', () => {
		it('should return a configured task', async () => {
			const task = await wombo.initTask();
			const configuredTask = await wombo.configureTask(
				task,
				prompt,
				style,
				image,
				display_freq
			);

			expect(configuredTask).toBeDefined();
		});
	});

	describe('createTask', () => {
		it('should init and configure a new task', async () => {
			const initTaskSpy = jest
				.spyOn(wombo, 'initTask')
				.mockReturnValue(Promise.resolve({} as Task));
			const configureTaskSpy = jest
				.spyOn(wombo, 'configureTask')
				.mockReturnValue(Promise.resolve({} as Task));
			const task = await wombo.createTask(prompt, style, image, display_freq);

			expect(task).toBeDefined();
			expect(initTaskSpy).toHaveBeenCalledTimes(1);
			expect(configureTaskSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('fetchTaskInfos', () => {
		it('should return task infos', async () => {
			const task = await wombo.initTask();
			const taskInfos = await wombo.fetchTaskInfos(task.id);

			expect(taskInfos).toBeDefined();
		});
	});

	describe('generatePicture', () => {
		it('should create a task and call callback with task progress until it is finished', (done) => {
			const numberOfIterations = 10;
			let remainingIterations = numberOfIterations;
			const callback = jest.fn(() => remainingIterations--);
			const createTaskSpy = jest
				.spyOn(wombo, 'createTask')
				.mockImplementation(() =>
					Promise.resolve({
						state: 'generating',
					} as Task)
				);
			const fetchTaskInfosSpy = jest
				.spyOn(wombo, 'fetchTaskInfos')
				.mockImplementation(() =>
					Promise.resolve({
						state: remainingIterations <= 0 ? 'completed' : 'generating',
					} as Task)
				);
			wombo
				.generatePicture(prompt, style, callback, image, 0, display_freq)
				.then((task) => {
					expect(task).toBeDefined();
					expect(createTaskSpy).toHaveBeenCalledTimes(1);
					expect(fetchTaskInfosSpy).toHaveBeenCalledTimes(
						numberOfIterations + 1
					);
					expect(callback).toHaveBeenCalledTimes(numberOfIterations + 1);
					done();
				});
		});
	});

	describe('uploadImage', () => {
		it('should upload an image', async () => {
			const image = await wombo.uploadImage(jpegImage);

			expect(image).toBeDefined();
		});
	});

	describe('fetchStyles', () => {
		it('should return styles', async () => {
			const styles = await wombo.fetchStyles();

			expect(styles).toBeDefined();
			expect(styles.length).toBeGreaterThan(0);
		});
	});

	describe('fetchTaskShopUrl', () => {
		it('should return a task shop url', async () => {
			const task = await wombo.initTask();
			const url = await wombo.fetchTaskShopUrl(task.id);

			expect(url).toBeDefined();
		});
	});

	describe('setUsername', () => {
		it('should set the username', async () => {
			await wombo.setUsername(createRandomUsername());
		});
	});

	describe('saveTaskToGallery', () => {
		it('should save a task to gallery', async () => {
			await wombo.setUsername(createRandomUsername());
			const generatedTask = await wombo.generatePicture('mountain', 34);
			const savedTask = await wombo.saveTaskToGallery(generatedTask.id);

			expect(savedTask).toBeDefined();
		}, 60000);
	});

	describe('fetchGalleryTask', () => {
		it('should return a gallery task', async () => {
			await wombo.setUsername(createRandomUsername());
			const generatedTask = await wombo.generatePicture('mountain', 34);
			const savedTask = await wombo.saveTaskToGallery(generatedTask.id);
			const galleryTask = await wombo.fetchGalleryTask(savedTask.id);

			expect(galleryTask).toBeDefined();
		}, 60000);
	});

	describe('fetchGalleryTasks', () => {
		it('should return gallery tasks', async () => {
			await wombo.setUsername(createRandomUsername());
			const generatedTask = await wombo.generatePicture('mountain', 34);
			const savedTask = await wombo.saveTaskToGallery(generatedTask.id);
			const galleryTasks = await wombo.fetchGalleryTasks();

			expect(galleryTasks).toBeDefined();
			expect(galleryTasks.length).toBeGreaterThan(0);
			expect(galleryTasks[0].id).toEqual(savedTask.id);
		}, 60000);
	});

	describe('deleteGalleryTask', () => {
		it('should delete a gallery task', async () => {
			await wombo.setUsername(createRandomUsername());
			const generatedTask = await wombo.generatePicture('mountain', 34);
			const savedTask = await wombo.saveTaskToGallery(generatedTask.id);
			const deletedGalleryTask = await wombo.deleteGalleryTask(savedTask.id);

			expect(deletedGalleryTask).toBeDefined();
		}, 60000);
	});
});
