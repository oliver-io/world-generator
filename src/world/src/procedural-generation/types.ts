import { type AreaData, type FloraType, type Room, type Entity, type NPCData, type NpcStaticData, type Flora, PersonalityTraits, MoodTraits, Biome } from '../../../types';
import { type gridIterator } from '@curiecode/structurators';

export type Grid = ReturnType<typeof gridIterator>;

export interface NPCSkeleton {
	appearance: string;
	personality: Array<PersonalityTraits>;
	mood: Array<MoodTraits>;
}

export interface ExitSkeleton {
	room: string;
	open: boolean;
	descriptor?: string;
}

export interface RoomSkeleton {
	terrain: string;
	biome: string;
	flora: Record<
		string,
		{
			type: FloraType;
			name: string;
			count: number;
		}
	>;
	elevation: 0 | 1 | 2 | 3;
	id: string;
	exits: {
		north?: ExitSkeleton;
		south?: ExitSkeleton;
		east?: ExitSkeleton;
		west?: ExitSkeleton;
		up?: ExitSkeleton;
		down?: ExitSkeleton;
	};
}

export interface GridSize {
	x: number;
	y: number;
}

interface FloraProbabilityDistribution {
	floraTypeProbabilities?: Record<FloraType, number>;
	floraIndividualProbabilities?: Partial<Record<string, number>>;
}

interface FloraProbabilityData extends FloraProbabilityDistribution {
	floraReproduction: { birth: number; death: number } & FloraProbabilityDistribution;
	floraSmoothingDepth: number;
}

export interface BiomeGenerationConfiguration extends Biome, FloraProbabilityData {
	availableFlora: Array<Flora>
}

export interface EntityGenerationConfiguration {
	availableEntities: Array<NPCSkeleton>;
	entityIndividualProbabilities?: Partial<Record<Entity['id'], number>>;
	entityDistribution?: 'random'
}

export interface AreaGenerationConfiguration extends AreaData, FloraProbabilityData {
	defaultBiome: BiomeGenerationConfiguration;
	availableBiomes: Array<BiomeGenerationConfiguration>;
	biomeIndividualProbabilities?: Partial<Record<BiomeGenerationConfiguration['name'], number>>;
	entities?: EntityGenerationConfiguration
}

export type OpenAiRoomPromptData = { id: Room['id'] } & {
	generalDescription: string;
	facts: string;
};

export interface OpenAIGeneratedData {
	id: Room['id'];
	name: string;
	shortDescription: string;
	description: string;
}
