/** @type {import('tailwindcss').Config} */

//const defaultTheme = require('tailwindcss/defaultTheme')
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';
import scrollbar from 'tailwind-scrollbar';
import debugScreens from 'tailwindcss-debug-screens';
import daisyui from 'daisyui';

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
				sans: [['Inter var', ...defaultTheme.fontFamily.sans].join(','), { fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"' }],
				// sans: ['Inter var', ...defaultTheme.fontFamily.sans],
			}
		},
		debugScreens: {
			prefix: '',
		},
	},
	plugins: [
		// require('@tailwindcss/forms'),
		forms,
		
		// require('@tailwindcss/typography'),
		typography,
		
		// require('@tailwindcss/aspect-ratio'),
		aspectRatio,
		
		// require('tailwind-scrollbar')({ nocompatible: true }),
		scrollbar({ nocompatible: true }),
		
		// require('tailwindcss-debug-screens'),
		debugScreens,
		
		// require('daisyui'),
		daisyui
	],
}

