import { JsonConversation, giveExample } from "@curiecode/lamechain";
import { AreaData, LoggerContext } from "../../../types";

export async function buildAreaGenModel(ctx: LoggerContext, options?: { examples?: boolean }) {
    const commandModel = new JsonConversation<{ prompt: string }, Omit<AreaData, 'defaultBiome'>>(ctx, {
        examples: options?.examples,
        config: {
            overallContext: `generate assets for a video game`,
            motivations: `turn an input prompt into a JSON markup for a game area`,
            rulesAndLimitations: [
                `try to keep the spirit of the prompt present in the output`
            ]
        },
        inputProperties: {
            prompt: 'a string describing a game area'
        },
        responseProperties: {
            name: 'the name of the area',
            description: 'a sentence or two describing the area',
        }
    });

    const conversation = await commandModel.init();

    for (const example of [
        { input: { prompt: 'a temperate forest' }, output: { name: 'Dense Temperate Forest', description: 'A mix of deciduous and some coniferous trees in a densely wooded forest'} },
        { input: { prompt: 'a savannah' }, output: { name: 'The Savannah', description: 'A wide expanse of arid terrain spotted with low-growing plants and trees.'} },
    ]) {
        await giveExample(conversation, example.input, example.output);
    }

    return conversation;
}
