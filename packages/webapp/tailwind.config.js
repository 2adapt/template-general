/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

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
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
		require('@tailwindcss/aspect-ratio'),
		require('tailwind-scrollbar')({ nocompatible: true }),
		require('tailwindcss-debug-screens'),
		require('daisyui')
	],
}

