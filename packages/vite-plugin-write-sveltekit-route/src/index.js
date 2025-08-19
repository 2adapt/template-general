import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// --- Helper Functions ---

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRouteId(filePath, routesDir) {
	const dir = path.dirname(filePath);
	console.log({ filePath, dir })
	let relativeDir = path.relative(routesDir, dir).replace(/\\/g, '/');
	console.log('1', { relativeDir })
	relativeDir = relativeDir.replace(/\/\([^)]+\)/g, '').replace(/^\([^)]+\)\//, '');
	console.log('2', { relativeDir })
	return (relativeDir === '' || relativeDir === '.') ? '/' : `/${relativeDir}`;
}

function getComment(routeId, fileExt, commentPrefix) {
	const commentText = `${commentPrefix}${routeId}`;
	return fileExt === '.svelte' ? `<!-- ${commentText} -->` : `// ${commentText}`;
}

/**
 * Reads a file to find, update, or add the route ID comment.
 */
function processFile(filePath, projectRoot, routesDir, commentPrefix, maxLines, dryRun, pathPrefix) {
	try {
		const fileExt = path.extname(filePath);
		if (!['.svelte', '.js', '.ts'].includes(fileExt)) return;

		const content = fs.readFileSync(filePath, 'utf8');
		const lines = content.split(/\r?\n/);

		const baseRouteId = getRouteId(filePath, routesDir);

		let finalRouteId = baseRouteId;
		if (pathPrefix) {
			let cleanPrefix = pathPrefix.trim();
			if (cleanPrefix) {
				if (!cleanPrefix.startsWith('/')) cleanPrefix = '/' + cleanPrefix;
				if (cleanPrefix.endsWith('/') && cleanPrefix.length > 1) cleanPrefix = cleanPrefix.slice(0, -1);
				if (cleanPrefix && cleanPrefix !== '/') {
					finalRouteId = (baseRouteId === '/') ? cleanPrefix : cleanPrefix + baseRouteId;
				}
			}
		}

		const newComment = getComment(finalRouteId, fileExt, commentPrefix);
		const relativePath = path.relative(projectRoot, filePath);
		const escapedPrefix = escapeRegex(commentPrefix);
		const regex = new RegExp(`(?:\/\/|<!--)\\s*${escapedPrefix}(\\/.*)\\s*(?:-->)?`);

		let commentFound = false;
		const linesToScan = maxLines > 0 ? Math.min(lines.length, maxLines) : lines.length;

		for (let i = 0; i < linesToScan; i++) {
			const match = lines[i].match(regex);
			if (match) {
				commentFound = true;
				const existingId = match[1].trim();

				if (existingId !== finalRouteId) {
					if (dryRun) {
						console.log(`[route-id] [DRY RUN] Would update comment in: ${relativePath}`);
					} else {
						lines[i] = newComment;
						fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
						console.log(`[route-id] Updated comment in: ${relativePath}`);
					}
				}
				break;
			}
		}

		if (!commentFound) {
			if (dryRun) {
				console.log(`[route-id] [DRY RUN] Would add comment to: ${relativePath}`);
			} else {
				lines.unshift(newComment);
				fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
				console.log(`[route-id] Added comment to: ${relativePath}`);
			}
		}
	} catch (error) {
		console.error(`[route-id] Failed to process ${filePath}:`, error);
	}
}

function walk(dir, callback) {
	fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, callback);
		} else if (entry.name.startsWith('+')) {
			callback(fullPath);
		}
	});
}

// --- Vite Plugin Definition ---

/**
 * A zero-dependency Vite plugin that writes or updates the SvelteKit route.id in files.
 * @param {object} [options] - Plugin options.
 * @param {string} [options.routesDir] - The root directory for SvelteKit routes. Defaults to 'src/routes' or the value from svelte.config.js.
 * @param {string[]} [options.whitelist] - An array of relative directories to apply the route ID comments to. If empty, all routes are processed.
 * @param {string} [options.commentPrefix='route.id: '] - The text to prepend to the route ID comment.
 * @param {string} [options.pathPrefix=''] - An optional path prefix to prepend to the route ID.
 * @param {number} [options.maxLines=10] - The number of lines to scan for the comment. Set to 0 for the whole file.
 * @param {boolean} [options.dryRun=false] - If true, logs actions without writing to files.
 */
export default function writeRouteId(options = {}) {
	const { routesDir, whitelist = [], commentPrefix = 'route.id: ', maxLines = 10, dryRun = false, pathPrefix = '' } = options;

	const finalCommentPrefix = (!commentPrefix || !commentPrefix.trim()) ? 'route.id: ' : commentPrefix;
	if (finalCommentPrefix !== commentPrefix) {
		console.warn(`[route-id] Invalid commentPrefix. Falling back to default: 'route.id: '`);
	}

	return {
		name: 'vite-plugin-write-route-id',
		apply: 'serve',

		async configureServer(server) {
			if (dryRun) console.log('[route-id] Dry run mode is enabled. No files will be modified.');
			if (pathPrefix) console.log(`[route-id] Using path prefix: ${pathPrefix}`);

			const { root: projectRoot } = server.config;
			let finalRoutesDir = '';

			// 1. Determine the single root directory for routes
			if (typeof routesDir === 'string' && routesDir.trim()) {
				finalRoutesDir = routesDir.trim();
				console.log(`[route-id] Using provided routesDir: ${finalRoutesDir}`);
			} else {
				const svelteConfigFiles = ['svelte.config.js', 'svelte.config.mjs', 'svelte.config.cjs'];
				const svelteConfigPath = svelteConfigFiles.map(file => path.resolve(projectRoot, file)).find(fs.existsSync);
				if (svelteConfigPath) {
					try {
						const svelteConfig = (await import(pathToFileURL(svelteConfigPath).href)).default;
						if (svelteConfig.kit?.files?.routes) {
							finalRoutesDir = svelteConfig.kit.files.routes;
							console.log(`[route-id] Detected routes directory from svelte.config.js: ${finalRoutesDir}`);
						}
					} catch (e) {
						console.error('[route-id] Error reading svelte.config.js. Falling back to default.', e);
					}
				}
				if (!finalRoutesDir) {
					finalRoutesDir = 'src/routes';
					console.log(`[route-id] No routesDir specified. Using default: ${finalRoutesDir}`);
				}
			}

			const routesDirAbs = path.resolve(projectRoot, finalRoutesDir);
			if (!fs.existsSync(routesDirAbs)) {
				console.warn(`[route-id] Routes directory not found: ${routesDirAbs}. Plugin will not run.`);
				return;
			}

			// 2. Resolve whitelist paths to absolute paths
			const whitelistAbs = Array.isArray(whitelist) ? whitelist.map(dir => path.resolve(projectRoot, dir)) : [];
			if (whitelistAbs.length > 0) {
				console.log(`[route-id] Whitelist enabled for directories:`, whitelist);
			}

			// 3. Define the file processor with the whitelist check
			const fileProcessor = (filePath) => {
				const shouldProcess = whitelistAbs.length === 0 || whitelistAbs.some(whitelistedDir => filePath.startsWith(whitelistedDir));
				if (shouldProcess) {
					processFile(filePath, projectRoot, routesDirAbs, finalCommentPrefix, maxLines, dryRun, pathPrefix);
				}
			};

			// 4. Scan and watch the entire routes directory
			console.log(`[route-id] Scanning files in ${path.relative(projectRoot, routesDirAbs)}...`);
			walk(routesDirAbs, fileProcessor);

			server.watcher.on('add', (filePath) => {
				if (filePath.startsWith(routesDirAbs) && path.basename(filePath).startsWith('+')) {
					console.log(`[route-id] New file detected: ${path.relative(projectRoot, filePath)}`);
					fileProcessor(filePath); // The check is inside fileProcessor
				}
			});
			console.log(`[route-id] Watching for new '+' files...`);
		},
	};
}