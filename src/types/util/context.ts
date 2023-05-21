import { PrimitiveRecord, PrimitiveValue } from "../util/types";

export interface Logger {
    info: (...args:(PrimitiveValue | PrimitiveRecord)[]) => void;
    error: (...args:(Error | PrimitiveValue | PrimitiveRecord)[]) => void;
    warn: (...args:(PrimitiveValue | PrimitiveRecord)[]) => void;
    debug: (...args:(PrimitiveValue | PrimitiveRecord)[]) => void;
    trace: (...args:(PrimitiveValue | PrimitiveRecord)[]) => void;
    child?: (...args:(PrimitiveValue | PrimitiveRecord)[]) => Logger;
    group?: (...args:(PrimitiveValue | PrimitiveRecord)[]) => void;
}

export type LoggerContext<T extends Logger = Logger> = {
    logger: T,
    debug?: boolean
};
