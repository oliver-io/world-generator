import { type Direction } from '../../../../types';
import pluralize from 'pluralize';
import { AreaGenerationConfiguration, type OpenAiRoomPromptData, type RoomSkeleton } from '../types';
import { gridIterator } from "@curiecode/structurators";
import { shuffle } from "../../../util";

function buildExitElevationFact(
	direction: Direction,
	room: RoomSkeleton,
	neighbor: RoomSkeleton
): string | undefined {
	if (!neighbor) {
		return;
	}
	if (room.exits[direction]?.descriptor) {
		return `there is a ${room.exits[direction]?.descriptor} to the ${direction}`;
	}
	switch (direction) {
		case 'north':
		case 'south':
		case 'east':
		case 'west':
			const elevationChange = neighbor.elevation - room.elevation;
			const grade = Math.abs(elevationChange);
			switch (grade) {
				case 1:
					return `there is a slight ${
						elevationChange > 0 ? 'slope' : 'downward slope'
					} to the ${direction} which leads to`;
				case 2:
					return `there is a steep ${
						elevationChange > 0 ? 'hill' : 'downhill slope'
					} to the ${direction} which leads to`;
				case 3:
					return `there is a ${
						elevationChange > 0 ? 'cliff face' : 'precipice'
					} to the ${direction} which ${
						elevationChange > 0 ? 'overlooks' : ' has atop it'
					}`;
				default:
					return `to the ${direction} there is`;
			}
		case 'up':
		case 'down':
			return `there is a ${
				room.exits[direction]?.descriptor ?? 'way'
			} leading ${direction === 'down' ? 'down' : 'up'}`;
		default:
			throw new Error(`Unknown direction: ${direction}`);
	}
}

function buildExitNeighborFact(
	direction: Direction,
	room: RoomSkeleton,
	neighbor: RoomSkeleton
) {
	if (!neighbor) {
		return;
	}
	switch (direction) {
		case 'north':
		case 'south':
		case 'east':
		case 'west':
			return `${neighbor.biome} with ${neighbor.terrain}`;
		case 'up':
			return `a ${neighbor.terrain} above`;
		case 'down':
			return `a ${neighbor.terrain} below`;
		default:
			throw new Error(`Unknown direction: ${direction}`);
	}
}

function buildPlantFacts(room: RoomSkeleton) {
	const facts: Array<string | undefined> = [];
	for (const plant of Object.keys(room.flora ?? {})) {
		const flora = room.flora?.[plant]!;
		const count = flora.count;
		if (count) {
			let quantity = '';
			switch (count) {
				case 1:
					quantity = '';
					break;
				case 2:
					quantity = 'regularly';
					break;
				case 3:
					quantity = 'plentifully';
					break;
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
					quantity = 'in abundance';
					break;
				default:
					quantity = 'in excess';
			}

			facts.push(
				(flora.type === 'tree'
					? `${flora.name} trees`
					: pluralize(flora.name)) + ` grow here ${quantity}`
			);
		}
	}

	return facts.length > 0 ? facts : [undefined];
}

function buildFacts(
	area: AreaGenerationConfiguration,
	room: RoomSkeleton,
	neighbors: Array<[direction: Direction, neighbor: RoomSkeleton]>
) {
	const facts: Array<string | undefined> = [];
	facts.push(`the biome here is a ${room.biome}`);
	facts.push(`the larger surrounding area is mostly ${area.defaultBiome.name}`);
	for (const [direction, neighbor] of neighbors) {
		facts.push(
			`${buildExitElevationFact(
				direction,
				room,
				neighbor
			)} ${buildExitNeighborFact(direction, room, neighbor)}`
		);
	}

	facts.push(...buildPlantFacts(room));

	return ` - ${shuffle(facts.filter((l) => !!l)).join('\n - ')}`;
}

export function generateFacts(
	area: AreaGenerationConfiguration,
	data: RoomSkeleton[][]
): OpenAiRoomPromptData[] {
	const facts: OpenAiRoomPromptData[] = [];
	for (const cell of gridIterator(data)) {
		const neighbors: Array<[Direction, RoomSkeleton]> = [];
		if (cell.north != null) {
			neighbors.push(['north', cell.north.next().value]);
		}
		if (cell.south != null) {
			neighbors.push(['south', cell.south.next().value]);
		}
		if (cell.east != null) {
			neighbors.push(['east', cell.east.next().value]);
		}
		if (cell.west != null) {
			neighbors.push(['west', cell.west.next().value]);
		}
		const generalDescription =
			cell.data.terrain === area.defaultBiome.defaultTerrain
				? `${area.name}: ${area.defaultBiome.name.toLowerCase()} with mostly ${
						area.defaultBiome.defaultTerrain
				  } on the ground`
				: `a section of ${cell.data.biome} ${cell.data.terrain} within a larger ${area.defaultBiome.name}`;

		facts.push({
			id: cell.data.id,
			generalDescription,
			facts: buildFacts(area, cell.data, neighbors),
		});
	}

	return facts;
}
