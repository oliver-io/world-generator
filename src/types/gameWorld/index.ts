import {
	type EntityId,
	type ObjectId,
	type RoomId,
	type RoomSlug,
} from '../common';
import { PhysicallyDescribed } from '../common/types';
import { EntityStaticData } from '../gameEntities';
import { ObjectData } from '../gameObjects';

// TERRAIN
export type TerrainType = 'grass'| 'dirt'| 'mud'| 'marsh'| 'rock'| 'gravel'| 'sand'| 'ice'| 'snow' | 'water';
export const terrainTypeValues:Array<TerrainType> = ['grass', 'dirt', 'mud', 'marsh', 'rock', 'gravel', 'sand', 'ice', 'snow' , 'water']
// FLORA
export type FloraType = 'tree'| 'flower'| 'grass'| 'fern'| 'bush'| 'vine'| 'fungus'| 'moss'| 'lichen'| 'succulent';
export const floraTypeValues:Array<FloraType> = ['tree', 'flower', 'grass', 'fern', 'bush', 'vine', 'fungus', 'moss', 'lichen', 'succulent']

export type Direction = 'north'| 'south'| 'east'| 'west'| 'up'| 'down';
export const directionTypeValues:Array<Direction> = ['north', 'south', 'east', 'west', 'up', 'down'];

export type HarvestableComponent = 'stem' | 'leaves' | 'bark' | 'roots' | 'flowers' | 'fruit' | 'seeds' | 'sap' | 'wood';
export const harvestableComponentsValues:Array<HarvestableComponent> = ['stem', 'leaves', 'bark', 'roots', 'flowers', 'fruit', 'seeds', 'sap', 'wood'];


export interface AreaData {
	name: string;
	description: string;
}

export interface Biome {
	name: string;
	description: string;
	defaultTerrain: TerrainType;
	commonTerrain: TerrainType[];
}

export interface Flora {
	type: FloraType;
	name: string;
	description?: string;
	harvestableComponents?: HarvestableComponent[];
	typicalMass: number;
	typicalHeight: number;
	requiresTerrain?: TerrainType;
	scientificName?: string;
}

export interface RoomStaticData extends PhysicallyDescribed {
	slug: RoomSlug;
	terrain: TerrainType;
}

export type RoomEntityData = Record<EntityId, number>;
export type RoomObjectData = Record<ObjectId, number>;

export interface RoomExitData {
	north?: RoomId;
	['north.locked']?: boolean;
	['north.closed']?: boolean;
	['north.diff']?: number;
	south?: RoomId;
	['south.locked']?: boolean;
	['south.closed']?: boolean;
	['south.diff']?: number;
	east?: RoomId;
	['east.locked']?: boolean;
	['east.closed']?: boolean;
	['east.diff']?: number;
	west?: RoomId;
	['west.locked']?: boolean;
	['west.closed']?: boolean;
	['west.diff']?: number;
	up?: RoomId;
	['up.locked']?: boolean;
	['up.closed']?: boolean;
	['up.diff']?: number;
	down?: RoomId;
	['down.locked']?: boolean;
	['down.closed']?: boolean;
	['down.diff']?: number;
}

export interface Room {
	id: RoomId;
	staticData: RoomStaticData;
	entityData: RoomEntityData;
	objectData: RoomObjectData;
	exitData: RoomExitData;
}

export interface HydratedRoom extends Room {
	entityStaticData: Record<EntityId, EntityStaticData>;
	objectStaticData: Record<ObjectId, ObjectData>;
}

export type GameMap = {
	rooms: Array<Room>
}
