let config = {
	experimentalTernaries: true,
	printWidth: 120,
	useTabs: true,
	singleQuote: true,
	plugins: ['prettier-plugin-svelte'],
	singleAttributePerLine: true,
	htmlWhitespaceSensitivity: 'strict',
	endOfLine: 'auto',

	overrides: [
		{
			files: '*.svelte',
			options: { parser: 'svelte' },
		},
	],
	svelteIndentScriptAndStyle: false,
	svelteStrictMode: true,
};

export default config;
