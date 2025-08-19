import { test, suite, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { execSync, spawn } from 'node:child_process';
import { stat, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory of the current test file (__dirname equivalent in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Modifies the vite.config.js file to include the custom plugin with specified options.
 * @param {string} projectDir - The root directory of the SvelteKit project.
 * @param {object} pluginOptions - The options object to pass to the plugin.
 */
async function addPluginToViteConfig(projectDir, pluginOptions = {}) {
	const viteConfigPath = path.join(projectDir, 'vite.config.js');
	const originalContent = await readFile(viteConfigPath, 'utf-8');
	const optionsString = JSON.stringify(pluginOptions);
	const modifiedContent = originalContent
		.replace(
			"import { defineConfig } from 'vite';",
			"import { defineConfig } from 'vite';\nimport plugin from '../../src/index.js';"
		)
		.replace('plugins: [sveltekit()]', `plugins: [sveltekit(), plugin(${optionsString})]`);
	await writeFile(viteConfigPath, modifiedContent, 'utf-8');
	console.log(`Successfully modified vite.config.js with options: ${optionsString}`);
}

suite('E2E Test: SvelteKit Project & Plugin Configuration', () => {
	let projectDir;
	let testCounter = 0;
	const hookOptions = { timeout: 60 * 1000 };

	beforeEach(async (t) => {
		testCounter++;
		const formattedCounter = String(testCounter).padStart(2, '0');
		const projectName = `sveltekit-demo-${formattedCounter}`;
		projectDir = path.join(__dirname, projectName);

		try {
			await stat(projectDir);
			const files = await readdir(projectDir);
			if (files.length > 0) {
				throw new Error(
					`Test setup failed: Directory "${projectDir}" already exists and is not empty. Please clear it before running tests.`
				);
			}
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}

		const createCommand = `npx --yes sv create --template demo --no-add-ons --no-types --install npm ${projectName}`;
		console.log(`[SETUP] Running for new test: ${createCommand}`);
		execSync(createCommand, { cwd: __dirname, stdio: 'inherit' });
		console.log(`[SETUP] SvelteKit project with dependencies installed created at: ${projectDir}`);
	}, hookOptions);

	afterEach(async (t) => {
		if (projectDir) {
			console.log(`[CLEANUP] The test for project '${path.basename(projectDir)}' is complete.`);
			console.log(`You can now manually delete the project directory: ${projectDir}`);
		}
	});

	test('sveltekit-demo-01: should create the SvelteKit project and install dependencies', async () => {
		assert.ok(projectDir, 'The project directory path should be set by beforeEach.');
		const projectStats = await stat(projectDir);
		assert.ok(projectStats.isDirectory(), `The project path should be a valid directory at ${projectDir}`);
		const nodeModulesDir = path.join(projectDir, 'node_modules');
		const nodeModulesStats = await stat(nodeModulesDir);
		assert.ok(nodeModulesStats.isDirectory(), `The 'node_modules' directory should exist at ${nodeModulesDir}`);
	});

	test('sveltekit-demo-02: should run plugin with default options and add comments to all files', async (t) => {
		await addPluginToViteConfig(projectDir, {}); // Test with default options

		let stdout = '';
		try {
			console.log('Starting dev server with a 5-second timeout...');
			execSync('npm run dev', { cwd: projectDir, timeout: 5 * 1000, encoding: 'utf-8' });
		} catch (err) {
			console.log('Dev server process timed out as expected.');
			stdout = err.stdout;
		}

		assert.ok(
			stdout.includes('VITE') && stdout.includes('ready in'),
			'The dev server should have started and shown the Vite ready message within 5 seconds.'
		);
		console.log('Successfully verified that the Vite server started.');

		const filesWithComment = [
			{ file: 'src/routes/+page.svelte', comment: '<!-- route.id: / -->' },
			{ file: 'src/routes/about/+page.svelte', comment: '<!-- route.id: /about -->' },
		];

		for (const { file, comment } of filesWithComment) {
			const filePath = path.join(projectDir, file);
			const fileContent = await readFile(filePath, 'utf-8');
			assert.ok(
				fileContent.startsWith(comment),
				`File "${file}" should start with the route ID comment. Got: "${fileContent.split('\\n')[0]}"`
			);
			console.log(`Successfully verified comment in ${file}`);
		}
	});

	test('sveltekit-demo-03: should respect the whitelist option and only modify specified files', async (t) => {
		await addPluginToViteConfig(projectDir, { whitelist: ['src/routes/about'] });

		let stdout = '';
		try {
			console.log('Starting dev server with a 5-second timeout...');
			execSync('npm run dev', { cwd: projectDir, timeout: 5 * 1000, encoding: 'utf-8' });
		} catch (err) {
			console.log('Dev server process timed out as expected.');
			stdout = err.stdout;
		}

		assert.ok(
			stdout.includes('VITE') && stdout.includes('ready in'),
			'The dev server should have started and shown the Vite ready message within 5 seconds.'
		);
		console.log('Successfully verified that the Vite server started.');

		const filesWithComment = [
			{ file: 'src/routes/about/+page.svelte', comment: '<!-- route.id: /about -->' },
		];

		const filesWithoutComment = ['src/routes/+page.svelte'];

		for (const { file, comment } of filesWithComment) {
			const filePath = path.join(projectDir, file);
			const fileContent = await readFile(filePath, 'utf-8');
			assert.ok(
				fileContent.startsWith(comment),
				`File "${file}" should start with the route ID comment.`
			);
			console.log(`Successfully verified comment in whitelisted file: ${file}`);
		}

		for (const file of filesWithoutComment) {
			const filePath = path.join(projectDir, file);
			const fileContent = await readFile(filePath, 'utf-8');
			assert.ok(
				!fileContent.startsWith('<!-- route.id:'),
				`File "${file}" should NOT start with a route ID comment.`
			);
			console.log(`Successfully verified NO comment in non-whitelisted file: ${file}`);
		}
	});
});