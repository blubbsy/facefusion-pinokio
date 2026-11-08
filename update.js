const { execSync } = require('child_process');
const path = require('path');

function getLatestTag()
{
	try
	{
		const output = execSync('git ls-remote --tags --refs https://github.com/facefusion/facefusion refs/tags/[0-9]*.[0-9]*.[0-9]*', { encoding: 'utf-8', timeout: 10000 });
		const tags = output.trim().split('\n')
			.map(line => line.split('refs/tags/').at(1)?.trim())
			.filter(tag => tag && /^\d+\.\d+\.\d+$/.test(tag));

		if (tags.length > 0)
		{
			tags.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
			return tags.at(-1);
		}
	}
	catch
	{
		// fallback
	}
	try
	{
		const output = execSync('git tag -l', { cwd: path.resolve(__dirname, 'facefusion'), encoding: 'utf-8', timeout: 5000 });
		const tags = output.trim().split('\n')
			.map(tag => tag.trim())
			.filter(tag => tag && /^\d+\.\d+\.\d+$/.test(tag));

		if (tags.length > 0)
		{
			tags.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
			return tags.at(-1);
		}
	}
	catch
	{
		// fallback
	}
	return '3.9.2';
}

function install(kernel)
{
	const { platform, gpu } = kernel;

	if (platform === 'linux' && gpu === 'amd')
	{
		return 'python install.py migraphx';
	}
	if (platform === 'win32' && gpu === 'amd')
	{
		return 'python install.py directml';
	}
	if ((platform === 'linux' || platform === 'win32') && gpu === 'intel')
	{
		return 'python install.py openvino';
	}
	if ((platform === 'linux' || platform === 'win32') && gpu === 'nvidia')
	{
		return 'python install.py cuda@12';
	}
	return 'python install.py default';
}

module.exports = async kernel =>
{
	const tag = getLatestTag();
	const config =
	{
		run:
		[
			{
				method: 'shell.run',
				params:
				{
					message: 'git pull'
				}
			},
			{
				method: 'shell.run',
				params:
				{
					message: 'git pull --tags',
					path: 'facefusion'
				}
			},
			{
				method: 'shell.run',
				params:
				{
					message: `git checkout ${tag}`,
					path: 'facefusion'
				}
			},
			{
				method: 'shell.run',
				params:
				{
					message: install(kernel),
					path: 'facefusion',
					conda:
					{
						path: path.resolve(__dirname, '.env')
					}
				}
			}
		]
	};

	return config;
};

