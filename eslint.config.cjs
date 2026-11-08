module.exports =
[
	{
		ignores:
		[
			'.env/**',
			'cache/**',
			'facefusion/**',
			'logs/**',
			'node_modules/**'
		]
	},
	...require('@isnotdefined/eslint-config/common')
];
