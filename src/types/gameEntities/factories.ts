import {EntityObjectData, EntityStateData, EntityStaticData, NpcStaticData} from ".";

type NPCFactoryOverrides = {
    staticData?: Partial<NpcStaticData>,
    stateData?: Partial<EntityStateData>,
    objectData?: Partial<EntityObjectData>
}

type CharacterFactoryOverrides = {
    staticData?: Partial<EntityStaticData>,
    stateData?: Partial<EntityStateData>,
    objectData?: Partial<EntityObjectData>
}

export function createNPCFactory(defaults: {
    prototype: string,
    staticData: Omit<NpcStaticData, 'isNPC'>,
    stateData: EntityStateData,
    objectData: EntityObjectData
}) {
    const createInstance = (instanceId: string, overrides?: NPCFactoryOverrides) => ({
        id: instanceId,
        prototype: defaults.prototype,
        staticData: Object.assign({
            ...defaults.staticData,
            isNPC: true,
        }, { ... (overrides?.staticData ?? {}) }),
        stateData: Object.assign({
            ...defaults.stateData,
        }, { ... (overrides?.stateData ?? {}) }),
        objectData: Object.assign({
            ...defaults.objectData,
        }, { ... (overrides?.objectData ?? {}) })
    });

    const createPrototype = (prototypeId: string, overrides: NPCFactoryOverrides) => createNPCFactory({
        ...createInstance('', overrides),
        prototype: prototypeId
    });

    return {
        createInstance,
        createPrototype
    }
}

export function createCharacterFactory(defaults: {
    prototype: string,
    staticData: EntityStaticData,
    stateData: EntityStateData,
    objectData: EntityObjectData
}) {
    const createInstance = (instanceId: string, overrides?: CharacterFactoryOverrides) => ({
        id: instanceId,
        prototype: defaults.prototype,
        staticData: Object.assign({
            ...defaults.staticData,
            isCharacter: true,
        }, { ... (overrides?.staticData ?? {}) }),
        stateData: Object.assign({
            ...defaults.stateData,
        }, { ... (overrides?.stateData ?? {}) }),
        objectData: Object.assign({
            ...defaults.objectData,
        }, { ... (overrides?.objectData ?? {}) })
    });

    const createPrototype = (prototypeId: string, overrides: CharacterFactoryOverrides) => createCharacterFactory({
        ...createInstance('', overrides),
        prototype: prototypeId
    });

    return {
        createInstance,
        createPrototype
    }
}