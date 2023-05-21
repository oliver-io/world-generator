import {
    createNPCFactory,
    MoodTraits,
    PersonalityTraits,
    possibleBadPersonalityTraits,
    possibleGoodMoodTraits,
    possibleGoodPersonalityTraits,
    possibleMoodTraits,
    possiblePersonalityTraits
} from "../../../../types";
import { NPCSkeleton } from "../types";
import { v4 as uuid } from "uuid";
import { continueConversation, getClient, startConversation } from '@curiecode/lamechain/src/clients/chatGPT';
import { JSONResponsetemplateHelper } from '@curiecode/lamechain';


function SECONDS(n: number) { return n * 1000 };

const factory = createNPCFactory({
    prototype: "npc",
    staticData: {
        name: "NPC",
        shortDescription: "NPC",
        description: "NPC",
        keywords: '',
        appearanceTraits: '',
        personalityTraits: '',
        defaultMoodTraits: '',
        currentMoodTraits: '',
        gender: 'none'
    },
    stateData: {
        location: '',
    },
    objectData: {},
});

function selectRandomEntryOfArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function selectRandomMood(type?: 'good' | 'bad'): MoodTraits {
    return selectRandomEntryOfArray(type === 'good'
        ? possibleGoodMoodTraits : type === 'bad'
            ? possibleMoodTraits
            : possibleMoodTraits);
}

function selectRandomPersonality(type?: 'good' | 'bad'): PersonalityTraits {
    return selectRandomEntryOfArray(type === 'good'
        ? possibleGoodPersonalityTraits : type === 'bad'
            ? possibleBadPersonalityTraits
            : possiblePersonalityTraits);
}

function maybeRunFunctionTimes(fn: () => any, chance: number, n = 2) {
    const result = [fn()];
    for (let i = 0; i < n; i++) {
        if (Math.random() < chance) {
            result.push(fn());
        }
    }
    return result;
}

function getRandomTraits() {
    const chanceOfTwoTraits = .25;
    const chanceOfGoodMood = .7;
    const chanceOfGoodPersonality = .7;
    const moodType = Math.random() < chanceOfGoodMood ? 'good' : 'bad';
    const personalityType = Math.random() < chanceOfGoodPersonality ? 'good' : 'bad';

    const moods = maybeRunFunctionTimes(
        () => selectRandomMood(moodType),
        chanceOfTwoTraits,
        2
    );

    const personalities = maybeRunFunctionTimes(
        () => selectRandomPersonality(personalityType),
        chanceOfTwoTraits,
        2
    );

    return [moods, personalities];
}

function skeletonToUnhydratedNPC(skeleton: NPCSkeleton): ReturnType<typeof factory.createInstance> {
    const [moods, personalities] = getRandomTraits();
    return factory.createInstance(uuid(), {
        staticData: {
            personalityTraits: personalities.join(','),
            description: skeleton.appearance,
            defaultMoodTraits: moods.join(','),
            currentMoodTraits: moods.join(',')
        }
    });
}

const { template: npcGenTemplate, itemParser, responseParser } = JSONResponsetemplateHelper(
    { logger: console as any },
    {
        inputProperties: { name: 'a name of the person', appearance: 'some input for you to use to generate the appearance' },
        responseProperties: {
            name: 'a name for the NPC',
            description: 'a description of the NPC, max 500 characters',
            shortDescription: 'a summary of the above description, around 20-40 characters',
            keywords: 'a list of keywords, separated by commas, that can be used to refer to the NPC',
            gender: `"male" or "female" or "none" as appropriate`
        },
        config: {
            overallContext: 'in a text-based religious roleplaying game',
            motivations: 'physically describe figures from our legendary New Testament, using a C.S. Lewis-like tone',
            rulesAndLimitations: [
                `Always speak from the third person in an objective tone that describes only what a viewer would see`,
                `Do not describe any clothing`,
                `Don't describe any items they carry`,
                `Do not make subjective references to qualities like beauty`,
                `Always use the PRESENT tense (i.e., "he is five feet tall")`
            ]
        }
    }
);

function genderParser(str?: string) {
    switch (str?.toLowerCase()) {
        case 'male':
            return 'male';
        case 'female':
            return 'female';
        default:
            return 'none';
    }
}

async function hydrateUnhydratedNPCs(unhydrated: Array<ReturnType<typeof factory.createInstance>>) {
    const client = getClient({ logger: console as any });
    const firstNPC = unhydrated.shift();
    if (!firstNPC) {
        throw new Error('No NPCs to hydrate');
    }

    const template = `${npcGenTemplate}\nOk let's begin, for the first item: \n${itemParser({
        name: firstNPC?.staticData.name,
        appearance: firstNPC?.staticData.description,
    })}`

    console.log(`Generating ${firstNPC.staticData.name}`)
    const proto = factory.createPrototype('saint', {});
    let i = setInterval(() => {
        console.log('Waiting for first response ...')
    }, SECONDS(30));

    const conversation = await startConversation({ logger: console }, {
        template: `${template}\n${itemParser({
            name: firstNPC?.staticData.name,
            appearance: firstNPC?.staticData.description,
        })}`, client
    });
    clearInterval(i);

    if (!conversation) {
        throw new Error('Could not start conversation');
    }
    const conversationId = conversation.id;
    if (!conversationId) {
        throw new Error('Could not start conversation');
    }

    const responseProperties = responseParser(conversation.text);
    if (!responseProperties) {
        throw new Error('Could not parse response');
    }
    const first = proto.createInstance(firstNPC.id, {
        ...firstNPC,
        staticData: {
            ...firstNPC.staticData,
            ...responseProperties,
            gender: genderParser(responseProperties.gender)
        }
    });


    const hydrated = [];
    hydrated.push(first);
    let n = 0;
    i = setInterval(() => {
        console.log(`Waiting for response number ${n} ...`)
    }, 10000);

    for (const skeleton of unhydrated) {
        n++;

        console.log(`Generating ${skeleton.staticData.name}`)
        const generationResponse = await continueConversation({ logger: console }, {
            conversationId: conversation.id,
            client,
            message: `Ok, next: \r\r${itemParser({
                name: skeleton.staticData.name,
                appearance: skeleton.staticData.description,
            })}`
        });

        if (!generationResponse) {
            throw new Error('Could not generate NPC');
        }

        const npcDetails = responseParser(generationResponse.text);
        const instance = proto.createInstance(skeleton.id, {
            ...skeleton,
            staticData: {
                ...skeleton.staticData,
                ...npcDetails,
                gender: genderParser(npcDetails.gender)
            }
        });

        hydrated.push(instance)
    }
    clearInterval(i);
    return hydrated;
}

export function generateNPCs(configs: Array<{ skeleton: NPCSkeleton[], num: number }>) {
    const npcs = [];
    for (const config of configs) {
        for (const skeleton of config.skeleton) {
            npcs.push(skeletonToUnhydratedNPC(skeleton));
        }
    }

    return hydrateUnhydratedNPCs(npcs);
}