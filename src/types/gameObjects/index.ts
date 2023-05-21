import { type ObjectId } from '../common';
import { PhysicallyDescribed } from '../common/types';

// OBJECTS
export type ObjectType = 'foliage' | 'item';
export interface ObjectData extends PhysicallyDescribed {
	flags: number;
	id: ObjectId;
	type: ObjectType;
	keywords: string;
}
