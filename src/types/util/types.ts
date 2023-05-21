export type PrimitiveSingle = string | number | boolean | undefined | null;
export type PrimitiveValue = PrimitiveSingle | Array<PrimitiveSingle>;
export type PrimitiveRecord = Record<string, PrimitiveValue>;
export type PartiallyRequiredRestIntact<T, L extends keyof T> = Required<Pick<T, L>> & Omit<T, L>;
export type PartiallyRequiredRestOptional<T, L extends keyof T> = Partial<T> & Required<Pick<T, L>>;
export type Maybe<T> = T | null | undefined;