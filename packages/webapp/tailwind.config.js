/** @type {import('tailwindcss').Config} */

//const defaultTheme = require('tailwindcss/defaultTheme')
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// a complete list of feature settings seems to be available here: https://github.com/semencov/tailwindcss-font-inter/blob/master/inter.json
			// more info: https://www.designermarkdavis.com/Feed/filter/glyphs
			sans: [['Inter var', ...defaultTheme.fontFamily.sans].join(','), { fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"' }],
		},
		debugScreens: {
			prefix: 'breakpoint: ',
			style: {
				backgroundColor: '#C0FFEE',
				color: 'black',
				// ...
			},
		},
	},
	plugins: [
		// require('@tailwindcss/forms'),
		import('@tailwindcss/forms'),
		
		// require('@tailwindcss/typography'),
		import('@tailwindcss/typography'),
		
		// require('@tailwindcss/aspect-ratio'),
		import('@tailwindcss/aspect-ratio'),
		
		// require('tailwind-scrollbar')({ nocompatible: true }),
		import('tailwind-scrollbar').then((module) => module.default({ nocompatible: true })),
		
		// require('tailwindcss-debug-screens'),
		import('tailwindcss-debug-screens'),
		
		// require('daisyui'),
		import('daisyui'),
	],
}

