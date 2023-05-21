export type AuthLoginKeySpaceItem = string;
export type AuthTokenKeySpaceItem = string;
export type EntityStateKeySpaceItem = string;
export type EntityObjectsKeySpaceItem = string;
export type EntityStaticKeySpaceItem = string;
export type EntityStreamKeySpaceItem = string;
export type RoomExitsKeySpaceItem = string;
export type RoomEntitiesKeySpaceItem = string;
export type RoomObjectsKeySpaceItem = string;
export type RoomStaticKeySpaceItem = string;
export type ObjectStateKeySpaceItem = string;
export type ObjectStaticKeySpaceItem = string;

export const authKeys = {
    loginKey: (username: string) => `login:${username}` as AuthLoginKeySpaceItem,
    tokenKey: (token: string) => `token:${token}` as AuthTokenKeySpaceItem
}

export const entityKeys = {
    state: (entityId: string) => `entity:state:${entityId}` as EntityStateKeySpaceItem,
    objects: (entityId: string) => `entity:objects:${entityId}` as EntityObjectsKeySpaceItem,
    static: (entityId: string) => `entity:static:${entityId}` as EntityStaticKeySpaceItem,
    stream: (entityId: string) => `PLAYERCHANNEL:${entityId}` as EntityStreamKeySpaceItem
}

export const roomKeys = {
    exits: (roomId: string) => `room:exits:${roomId}` as RoomExitsKeySpaceItem,
    entities: (roomId: string) => `room:entities:${roomId}` as RoomEntitiesKeySpaceItem,
    objects: (roomId: string) => `room:objects:${roomId}` as RoomObjectsKeySpaceItem,
    static: (roomId: string) => `room:static:${roomId}` as RoomStaticKeySpaceItem
}

export const objectKeys = {
    state: (objectId: string) => `object:state:${objectId}` as ObjectStateKeySpaceItem,
    static: (objectId: string) => `object:static:${objectId}` as ObjectStaticKeySpaceItem
}