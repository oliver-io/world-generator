export interface OkServerActionResponse {
	ok: true;
	message: string;
}

export interface NotOkServerActionResponse {
	ok: false;
	message: string;
	error?: string;
}

export type ServerActionResponse =
	| OkServerActionResponse
	| NotOkServerActionResponse;


export type ServerMessageType = 'client' | 'game';
export type GameEventType = 'item:event' | 'entity:acting' | 'entity:speech' | 'entity:move';
export type ClientEventType = 'login' | 'error' | 'info' | 'warn';

export interface ServerMessage {
    ok: boolean;
    message: string;
    eventType: ServerMessageType;
    messageType: ClientEventType | GameEventType;
}

export interface ServerGameMessage extends ServerMessage {
    ok: true,
    eventType: 'game',
    messageType: GameEventType,
    eventRoomId?: string
}

export interface ServerClientMessage extends ServerMessage {
    eventType: 'client',
    messageType: ClientEventType
}