import { type AreaData, type Room } from '../../../types';
import { generateFacts } from './openAI/buildRoomFactStatements';
import { translateRoomFromSkeleton } from './openAI/mergeSkeletonWithOpenAIData';
import { template } from './openAI/openAIConvoTemplate';
import {
	AreaGenerationConfiguration,
	type OpenAIGeneratedData,
	type OpenAiRoomPromptData,
	type RoomSkeleton,
} from './types';
export async function createPromptData(area: AreaGenerationConfiguration, map: RoomSkeleton[][]) {
	console.group('Generating prompts!');
	const facts = generateFacts(area, map);
	console.groupEnd();
	console.log('Successfully generated prompts!');
	return facts;
}

export async function mapOpenAIResponseToRooms(
	generatedData: OpenAIGeneratedData[],
	rooms: RoomSkeleton[]
) {
	const generatedRooms: Room[] = [];
	for (const data of generatedData) {
		const roomSkeleton = rooms.find(({ id }) => id === data.id);
		if (roomSkeleton == null) {
			throw new Error(`No room skeleton found for generated data ${data.id}`);
		}
		generatedRooms.push(translateRoomFromSkeleton(data, roomSkeleton));
	}
	console.log('Successfully hydrated rooms!');
	console.groupEnd();
	return generatedRooms;
}

export type IDPairedOpenAITemplate = Array<{ id: string; template: string }>;

export async function buildOpenAITemplates(
	map: OpenAiRoomPromptData[]
): Promise<IDPairedOpenAITemplate> {
	const templates = [];
	for (const prompt of map) {
		templates.push({
			id: prompt.id,
			template: template(prompt.generalDescription, prompt.facts),
		});
	}
	return templates;
}
