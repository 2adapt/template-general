//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		preserveComments: true,
		preserveWhitespace: true,
		enableSourcemap: false,
	},
	kit: {
		// https://kit.svelte.dev/docs/adapter-node
		adapter: adapter({
			// svelte-kit will read these env variables: WEBAPP_PORT; WEBAPP_ORIGIN
			out: 'build',
			envPrefix: 'WEBAPP_',
		}),

		typescript: {
			config: (config) => {
				config.compilerOptions.sourceMap = false;
				config.compilerOptions.inlineSourceMap = false;

				return config;
			},
		},

		// we want all static content (fonts, images, client-side js and css generated by svelte kit, any other file)
		// to be served from a path that starts with "/static-webapp" (instead of the default, which is simple "/");
		// we can achieve this by doing 2 things:
		//
		// 1) set the appDir configuration as is below; the build directory for the generated client-side app
		// (created with "pnpm run build") will then be "packages/webapp/build/client/" + "static-webapp/_app";
		// (instead of the default build directory, which would be "packages/webapp/build/client/" + "_app", 
		// as "_app" is the default value;)
		//
		// 2) in the default static directory ("packages/webapp/static"), create a single "static-webapp" subdirectory,
		// and place all static assets there (including favicon.ico)

		// since the sub-directory is the same for static assets and for the assets relative to the client-side app,
		// (generated by vite/roolup) the result is that the build for the client-side will have this structure:
		//
		// "packages/webapp/build/client/static-webapp/_app"
		// "packages/webapp/build/client/static-webapp/static-file.css"
		// "packages/webapp/build/client/static-webapp/some-dir/image.png"

		// it's important that inside "packages/webapp/static/static-webapp" we DO NOT have a "_app" subdirectory, otherwise
		// it would probably conflict with the "_app" subdirectory created dynamically by "pnpm run build"


		appDir: 'static-webapp/_app',
	},
	// package: ...
	preprocess: vitePreprocess(), // necessary for tailwindcss (enable processing <style> blocks as PostCSS)
	// vitePlugin: ...
};

export default config;
