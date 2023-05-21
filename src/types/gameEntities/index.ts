import { type EntityId, type ObjectId, type RoomId } from '../common';
import { PhysicallyDescribed } from '../common/types';
export * from './npcs';

export interface EntityStaticData extends PhysicallyDescribed {
	keywords: string;
	isNPC?: boolean;
	gender: 'male' | 'female' | 'none';
}

type PersonalityTraitsCSV = string;
type AppearanceTraitsCSV = string;
type MoodTraitsCSV = string;

export interface NPCData {
	isAIControlled?: boolean;
	brain?: string;
	personalityTraits: PersonalityTraitsCSV;
	appearanceTraits: AppearanceTraitsCSV;
	defaultMoodTraits: MoodTraitsCSV;
	currentMoodTraits: MoodTraitsCSV;
}

export interface NpcStaticData extends EntityStaticData, NPCData {
	isNPC?: true;
}

export interface EntityStateData {
	location: RoomId;
}

export type EntityObjectData = Record<ObjectId, number>;

export interface Entity {
	id: EntityId;
	staticData: EntityStaticData;
	stateData: EntityStateData;
	objectData: EntityObjectData;
}

export * from './factories';