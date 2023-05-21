import { Logger } from '../../../types';
import { config } from 'dotenv';
import pino from 'pino';

class WorldGenConfigurationError extends Error {
	constructor(message: string) {
		super(`Configuration Error: ${message}`);
	}
}

export function buildConfig(logger?: Logger) {
	const baseConfig = {
		...config({ path: '../../.global.env' }).parsed,
		...config({ path: '.env' }).parsed,
		REGENERATE: Boolean(
			(process.env.REGENERATE ?? '').trim().toLowerCase() === 'false'
				? false
				: (process.env.REGENERATE ?? '').trim().toLowerCase()
		),
		logger: logger ?? pino(),
	} as {
		RPGPT_ENV: string;
		OPENAI_API_KEY: string;
		REGENERATE: boolean;
		logger: Logger
	};

	if (!baseConfig.RPGPT_ENV) {
		console.log(baseConfig);
		throw new WorldGenConfigurationError('Environment is not set');
	}

	if (!baseConfig.OPENAI_API_KEY) {
		throw new WorldGenConfigurationError('API key is not set');
	}

	switch (baseConfig.RPGPT_ENV) {
		case 'dev':
		case 'prod':
		case 'test':
		case 'debug':
			return {
				...baseConfig,
			};
		default:
			throw new WorldGenConfigurationError(
				`Environment ${baseConfig.RPGPT_ENV} is not supported`
			);
	}
}
