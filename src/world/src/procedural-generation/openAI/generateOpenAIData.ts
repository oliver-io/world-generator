import { Logger } from '../../../../types';
import { type buildOpenAITemplates, IDPairedOpenAITemplate } from '../transforms';
import { type OpenAIGeneratedData } from '../types';

function findFields(input: string): {
	name: string;
	shortDescription: string;
	description: string;
} {
	let substring = input.substring(input.indexOf('{'), input.indexOf('}') + 1);
	substring = substring.replace(/\n/g, '');
	try {
		return JSON.parse(substring);
	} catch (err) {
		console.error({ err, substring });
		return {
			name: 'Could Not Generate',
			shortDescription: 'Could Not Generate',
			description: 'Could Not Generate',
		};
	}
}

export async function transformTemplatesToOpenAIResponses(
	config: { OPENAI_API_KEY: string, logger: Logger },
	data: IDPairedOpenAITemplate
) {
	const { ChatGPTAPI } = await import('chatgpt');
	const { default: pMap } = await import('p-map');

	const client = new ChatGPTAPI({
		apiKey: config.OPENAI_API_KEY,
	});

	// const generatedData: Array<OpenAIGeneratedData> = [];
	const generators: Array<() => Promise<OpenAIGeneratedData>> = [];

	for (const { id, template } of data) {
		generators.push(async () => {
			console.log('Dispatching message to OpenAI...');
			const response = await client.sendMessage(template);
			if (response?.text) {
				console.log('Successful response from openai!!!');
				return ({ id, ...findFields(response.text) } as OpenAIGeneratedData)
			} else {
				throw new Error("Couldn't generate data from OpenAI");
			}
		});
	}

	return await pMap(
		generators,
		async (generator) => await generator(),
		{ concurrency: 3 }
	);
}
