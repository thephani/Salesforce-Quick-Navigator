export default [
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				chrome: 'readonly',
				document: 'readonly',
				Event: 'readonly',
				Headers: 'readonly',
				URL: 'readonly',
				console: 'readonly',
				fetch: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
			'no-undef': 'error',
		},
	},
	{
		files: ['tests/**/*.js'],
		languageOptions: {
			globals: {
				describe: 'readonly',
				it: 'readonly',
			},
		},
	},
];
