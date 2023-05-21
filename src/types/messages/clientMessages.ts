import { ServerClientMessage } from "./base";

export interface ClientCommandErrorMessage extends ServerClientMessage {
    ok: false,
    eventType: 'client',
    messageType: 'error',
    messageSource: 'game:command',
    command: string,
    args?: string[],
    suggestion?: string
}

export interface ClientCommandHintMessage extends ServerClientMessage {
    ok: true,
    eventType: 'client',
    messageType: 'info',
    messageSource: 'command:hint',
    commandArray: string[]
}


export interface ClientLoginMessage extends ServerClientMessage {
    ok: true,
    eventType: 'client',
    messageType: 'info',
    messageSource: 'login',
    created: boolean,
    token: string
}

export type PossibleClientMessageTypes = ClientLoginMessage | ClientCommandErrorMessage | ClientCommandHintMessage;
