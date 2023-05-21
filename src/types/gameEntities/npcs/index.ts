import { type EntityStaticData } from '..';
import { type AppearanceTraitsCSV } from './appearances';
import { type MoodTraitsCSV } from './moods';
import { type PersonalityTraitsCSV } from './personalities';
export * from './appearances';
export * from './moods';
export * from './personalities';

export interface NPCData {
	isAIControlled?: boolean;
	brain?: string;
	personalityTraits: PersonalityTraitsCSV;
	appearanceTraits: AppearanceTraitsCSV;
	defaultMoodTraits: MoodTraitsCSV;
	currentMoodTraits: MoodTraitsCSV;
}

export interface NpcStaticData extends EntityStaticData {
	isNPC?: true;
	NPCData: NPCData
}