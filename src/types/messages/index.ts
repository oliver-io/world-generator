import { PossibleClientMessageTypes } from './clientMessages';
import { PossibleGameMessageTypes } from './gameMessages';

export * from './gameMessages';
export * from './factories';
export * from './clientMessages';

export type PossibleCommandResponses = PossibleClientMessageTypes | PossibleGameMessageTypes;