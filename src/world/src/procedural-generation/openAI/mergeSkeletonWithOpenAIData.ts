import { type Room, RoomExitData, type TerrainType } from '../../../../types';
import { Direction } from '../../../../types/gameWorld';
import { ExitSkeleton, type OpenAIGeneratedData, type RoomSkeleton } from '../types';

export function translateRoomFromSkeleton(
	generatedData: OpenAIGeneratedData,
	room: RoomSkeleton
): Room {
	if (!generatedData) {
		throw new Error(`No generated data found for room ${room.id}`);
	}
	const exits:RoomExitData = {};
	const exitKeys = Object.keys(room.exits) as Array<Direction>;
	for (const exit of exitKeys) {
		const exitSkeleton:ExitSkeleton|undefined = room.exits[exit];
		if (!exitSkeleton || !exitSkeleton.room) {
			console.log('Skippieroo')
			console.log({ exits: room.exits, exitDirAttempt: exit });
			continue;
		}
		exits[exit] = exitSkeleton.room;
		// exits[`${exit}.open`] = exitSkeleton.open;
	}
	return {
		id: room.id,
		staticData: {
			name: generatedData.name,
			description: generatedData.description,
			shortDescription: generatedData.shortDescription,
			terrain: room.terrain as TerrainType,
			slug: '',
		},
		exitData: {
			...exits,
		},
		entityData: {},
		objectData: {},
	};
}
