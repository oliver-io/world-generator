import { LastRecordedHere } from "..";
import { EntityId, ObjectId } from "../common";
import { EntityStaticData } from "../gameEntities";
import { ObjectData } from "../gameObjects";
import { Room } from "../gameWorld";
import { Maybe, PartiallyRequiredRestIntact } from "../util/types";
import { ServerGameMessage } from "./base";

type InRoomGameEvent = PartiallyRequiredRestIntact<ServerGameMessage, 'eventRoomId'>;

interface ActorIdentifiedGameMessage extends InRoomGameEvent {
    actorId: string,
    actorDescriptor: string;
    targetEntityId?: string,
    targetEntityDescriptor?: string
    targetObjectId?: string;
    targetObjectDescriptor?: string;
}

interface UpdatingGameMessage extends InRoomGameEvent {
    roomEntityUpdate?: Record<EntityId, Maybe<LastRecordedHere>>,
    roomEntityStaticUpdate?: Record<EntityId, EntityStaticData>,
    roomObjectUpdate?: Record<ObjectId, Maybe<LastRecordedHere>>,
    roomObjectDataUpdate?: Record<ObjectId, ObjectData>,
    roomUpdate?: Room
}

export interface ServerEntityCommMessage extends
    InRoomGameEvent,
    ActorIdentifiedGameMessage {
    messageType: 'entity:acting' | 'entity:speech';
}

export interface ServerEntityItemInteractMessage extends
    InRoomGameEvent,
    PartiallyRequiredRestIntact<ActorIdentifiedGameMessage, 'targetObjectId' | 'targetObjectDescriptor'>,
    PartiallyRequiredRestIntact<UpdatingGameMessage, 'roomObjectUpdate' | 'roomObjectDataUpdate'> {
    messageType: 'item:event'
}

export interface ServerEntityMovementMessage extends
    InRoomGameEvent,
    PartiallyRequiredRestIntact<UpdatingGameMessage, 'roomEntityUpdate' | 'roomEntityStaticUpdate'> {
    messageType: 'entity:move'
}

export type PossibleGameMessageTypes = ServerEntityMovementMessage | ServerEntityItemInteractMessage | ServerEntityCommMessage;