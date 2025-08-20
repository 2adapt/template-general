import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';
import scrollbar from 'tailwind-scrollbar';
import debugScreens from 'tailwindcss-debug-screens';
// import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				// a complete list of feature settings seems to be available here:
				// https://github.com/semencov/tailwindcss-font-inter/blob/master/inter.json
				// more info:
				// https://www.designermarkdavis.com/Feed/filter/glyphs
				// https://tailwindcss.com/docs/font-family#providing-default-font-settings
				sans: [
					['InterVariable', ...defaultTheme.fontFamily.sans].join(','),
					{
						fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
					},
				],
				// sans: ['InterVariable', ...defaultTheme.fontFamily.sans],
			},
		},
		debugScreens: {
			prefix: '',
		},
	},
	plugins: [
		forms,
		typography,
		aspectRatio,
		scrollbar({ nocompatible: true }),
		debugScreens,
		// daisyui,
	],
} satisfies Config





