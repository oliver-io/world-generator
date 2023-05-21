import { JsonConversation, qualify, giveExample } from "@curiecode/lamechain";
import { Biome, Flora, floraTypeValues, LoggerContext, PrimitiveRecord, terrainTypeValues } from "../../../types";

type BiomeRecord = Record<keyof Biome, string | string[]> & { possibleFloraTypes: string };
type FloraRecord = Flora & PrimitiveRecord;

export async function buildFloraGenModel(ctx: LoggerContext, options?: { examples?: boolean }) {
    const commandModel = new JsonConversation<BiomeRecord, FloraRecord>(ctx, {
        examples: options?.examples,
        config: {
            overallContext: `generating content for a text based game`,
            motivations: `take a biome and create a flora declaration`,
            rulesAndLimitations: [
                'try to make the flora match the premise of the biome in general'
            ]
        },
        inputProperties: {
            name: 'the name of the biome',
            description: 'a sentence or two long description of this biome',
            possibleFloraTypes: `a list of possible plant types, which will always be a CSV from the set "${floraTypeValues.join(' | ')}"`,
            defaultTerrain: `the default terrain type for this biome, which will always be one of "${terrainTypeValues.join(' | ')}"` as any,
            commonTerrain: `a CSV list of common terrain types for this biome` as any
        },
        responseProperties: {
            type: 'the closest matching type from the list of input TYPEs' as any,
            name: 'the name of the plant',
            scientificName: 'the scientific name of the plant',
            description: `a SENTENCE or two long description of this plant's typical physical appearance`,
            rarity: `a NUMBER between 0 (rare) and 1 (common) indicating the chance that this plant will be found in a given biome`,
            harvestableComponents: 'an ARRAY of components that can be harvested from this plant' as any,
            typicalHeight: 'a NUMBER representing the typical height of this plant in meters' as any,
            typicalMass: 'a NUMBER representing the typical mass of this plant in kilograms' as any,
            requiresTerrain: '[OPTIONAL] a STRING terrain type that this plant must have, like `water` for lillies' as any,
            requiresSymbiote: '[OPTIONAL] an ARRAY of scientific names that this plant must have nearby to grow' as any,
        }
    });

    const conversation = await commandModel.init();
    await giveExample(conversation, {
        name: 'a temperate forest',
        description: 'A mix of deciduous and some coniferous trees in a densely wooded forest',
        possibleFloraTypes: terrainTypeValues.join(','),
        defaultTerrain: 'grass',
        commonTerrain: 'grass, dirt, sand'
    }, {
        type: 'tree',
        name: 'yellow birch',
        scientificName: 'Betula alleghaniensis',
        description: `This medium-sized deciduous tree typically grows 18 to 23 meters tall, featuring a distinctive peeling, golden-yellow to silvery-gray bark that curls and shimmers in the sunlight. Its leaves are ovate, serrated, and dark green, while the graceful, drooping branches support delicate catkins, adding to the tree's picturesque appearance.`,
        rarity: .5,
        harvestableComponents: ['bark', 'leaves', 'sap', 'roots', 'wood'],
        typicalHeight: 20,
        typicalMass: 7500,
    });
    await giveExample(conversation, {
        name: 'a temperate forest',
        description: 'A mix of deciduous and some coniferous trees in a densely wooded forest',
        possibleFloraTypes: 'flower',
        defaultTerrain: 'grass',
        commonTerrain: 'grass, dirt, sand'
    }, {
        type: 'flower',
        name: 'daisy',
        scientificName: 'Bellis perennis',
        description: `The daisy is a small, herbaceous perennial plant that typically grows up to 15 cm tall, with simple, spoon-shaped, dark green leaves that form a rosette at the base. Its charming flower head consists of a yellow central disc surrounded by numerous white or pinkish-white ray florets, creating a classic, cheerful appearance.`,
        rarity: .2,
        harvestableComponents: ['flowers', 'leaves', 'roots'],
        typicalHeight: 0.15,
        typicalMass: 0.02
    });

    await giveExample(conversation, {
        name: 'a temperate forest',
        description: 'A mix of deciduous and some coniferous trees in a densely wooded forest',
        possibleFloraTypes: 'flower',
        defaultTerrain: 'grass',
        commonTerrain: 'grass, dirt, sand'
    }, {
        type: 'flower',
        name: 'water lily',
        scientificName: 'Nymphaea',
        description: `The water lily is a perennial, aquatic plant characterized by its large, round, floating leaves that are typically 15 to 30 cm in diameter and have a slightly notched edge. The leaves are attached to long, slender stalks that anchor the plant to the bottom of a water body. The plant's flowers are showy and fragrant, with numerous petals that range in color from white to pink, yellow, or blue, depending on the species. Flowers typically bloom from spring to fall, and their beauty is a highlight of aquatic gardens and ponds.`,
        rarity: .7,
        harvestableComponents: ['flowers', 'leaves', 'roots', 'seeds'],
        typicalHeight: 0.15,
        typicalMass: 0.5,
        requiresTerrain: ['water']
    });

    await giveExample(conversation, {
        name: 'a temperate forest',
        description: 'A mix of deciduous and some coniferous trees in a densely wooded forest',
        possibleFloraTypes: 'flower',
        defaultTerrain: 'grass',
        commonTerrain: 'grass, dirt, sand'
    }, {
        "type": "moss",
        "name": "oak moss",
        "scientificName": "Evernia prunastri",
        "description": "A type of lichen that grows on the branches and trunks of oak trees, forming a dense, velvety mat that ranges in color from gray-green to yellow-green. Oak moss has a distinctive scent that is earthy, woody, and slightly sweet, making it a popular ingredient in perfumes and fragrances.",
        rarity: .1,
        "harvestableComponents": [ "lichen" ],
        "typicalHeight": 0.1,
        "typicalMass": 0.01,
        "requiresTerrain": [
          "dirt",
          "mud"
        ],
        "requiresSymbiote": [
            "Quercus alba",
            "Quercus robur",
            "Quercus rubra"
        ]
    });

    await qualify(conversation, `You do not need to include "requiresTerrain" property for normal plants, just special ones.`)
    await qualify(conversation, `You do not need to include "requiresSymbiote" property for normal plants, just special ones.`)
    return conversation;
}
