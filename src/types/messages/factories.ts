import {
    ServerEntityCommMessage,
    ServerEntityItemInteractMessage,
    ServerEntityMovementMessage,
} from "./gameMessages";
import {
    ClientCommandErrorMessage
} from './clientMessages'

// ServerEntityCommMessage factory
export function createServerEntityCommMessage(options: {
    message: string;
    eventRoomId: string;
    actorId: string;
    actorDescriptor: string;
    messageType: "entity:acting" | "entity:speech",
    targetEntityId?: string;
    targetEntityDescriptor?: string;
}): ServerEntityCommMessage {
    return {
        ...options,
        messageType: options.messageType,
        ok: true,
        eventType: "game"
    };
}

// ServerEntityItemInteractMessage factory
export function createServerEntityItemInteractMessage(options: {
    message: string;
    eventRoomId: string;
    actorId: string;
    actorDescriptor: string;
    targetEntityId?: string;
    targetEntityDescriptor?: string;
    targetObjectId: string;
    targetObjectDescriptor: string;
    roomObjectUpdate: Record<string, any>;
    roomObjectDataUpdate: Record<string, any>;
}): ServerEntityItemInteractMessage {
    return {
        ...options,
        ok: true,
        eventType: "game",
        messageType: "item:event",
    };
}

export function createServerEntityMovementMessage(options: {
    message: string;
    eventRoomId: string;
    roomEntityUpdate: Record<string, any>;
    roomEntityStaticUpdate: Record<string, any>;
}): ServerEntityMovementMessage {
    return {
        ...options,
        ok: true,
        eventType: "game",
        messageType: "entity:move",
    };
}

export function createClientCommandErrorMessage(options: {
    message: string;
    command: string;
    args?: string[];
    suggestion?: string;
}): ClientCommandErrorMessage {
    return {
        ...options,
        ok: false,
        eventType: "client",
        messageType: "error",
        messageSource: "game:command"
    };
}