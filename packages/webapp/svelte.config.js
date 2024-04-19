//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		preserveComments: true,
		preserveWhitespace: true,
		enableSourcemap: false
	},
	kit: {

		// https://kit.svelte.dev/docs/adapter-node
		adapter: adapter({
			// svelte-kit will read these env variables: WEBAPP_PORT; WEBAPP_ORIGIN
			out: 'build',
			envPrefix: 'WEBAPP_'
		}),

		typescript: {
			config: (config) => {

				config.compilerOptions.sourceMap = false;
				config.compilerOptions.inlineSourceMap = false;

				return config;
			}
		},

		// we want all static content (fonts, images, client-side js and css generated by svelte kit, any other file)
		// to be served from a path that starts with "/static-v1"; we can achieve it by doing 2 things:
		//
		// 1) set the appDir configuration as is below; the build directory will then have a nested "build/client/static-v1/_app"
		// subdirectory created dynamicaly, for the generated client-side app 
		// (by default it would be "build/client/_app", as "_app" is the default value)
		//
		// 2) in the default static directory ("packages/webapp/static"), create a single "static-v1" subdirectory, 
		// and place all static assets in these

		// since we are using the same name for the sub-directory, the result is that the build will have this structure
		// "build/client/static-v1/_app"
		// "build/client/static-v1/static-file.css"
		// "build/client/static-v1/some-dir/image.png"

		// it's important that inside "static-v1" we should NOT have a "_app" subdirectory, otherwise it would
		// probably conflict with the "_app" directory created dynamically for the client-side javascript

		appDir: 'static-v1/_app',


	},
	// package: ...
	preprocess: vitePreprocess(),  // necessary for tailwindcss (enable processing <style> blocks as PostCSS)
	// vitePlugin: ...
};

export default config;