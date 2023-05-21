import { JsonConversation, qualify } from "@curiecode/lamechain";
import { LoggerContext } from "../../../types";

export async function buildBiomeGenModel(ctx: LoggerContext, options?: { examples?: boolean }) {
    const commandModel = new JsonConversation(ctx, {
        examples: options?.examples,
        config: {
            overallContext: `generating content for a text based game`,
            motivations: `take an area in a game and create a biome declaration`,
            rulesAndLimitations: [
                'try to make the biome match the area in general'
            ]
        },
        inputProperties: {
            name: 'the name of the area',
            description: 'a sentence or two describing the area',
            possibleTerrainTypes: 'a comma separated list of terrain types that could be in this area',
            biomeRequest: '[OPTIONALLY PRESENT]: a string describing a specific kind of biome to generate',
        },
        responseProperties: {
            name: 'the name of a biome that fits in the INTERACTION CONTEXT properties',
            description: 'a sentence or two long description of this biome',
            defaultTerrain: 'the default terrain type for this biome' as any,
            commonTerrain: 'an ARRAY list of terrain types that are common in this biome' as any,
        }
    });

    const conversation = await commandModel.init();
    await qualify(conversation, 'If a `biomeRequest` is present, try to generate a biome matching it as closely as possible');

    // for (const example of examples) {
    //     await giveExample(conversation, example.input, example.output);
    // }

    return conversation;
}
