import { AreaData, Biome, Flora } from '../../types';
import { buildAreaGenModel } from '../src/models/areaModel';
import { buildBiomeGenModel } from '../src/models/biomeModel';
import { buildFloraGenModel } from '../src/models/floraModel';
import { buildConfig } from '../util/config'
const moduleMap = {
    'area': {
        module: buildAreaGenModel,
        default: {
            prompt: 'a rainforest'
        }
    },
    'biome': {
        module: buildBiomeGenModel,
        default: {
            name: '',
            description: ''
        } as AreaData
    },
    'flora': {
        module: buildFloraGenModel,
        default: {
            name: ''
        } as Biome
    }
}

async function run() {
    const target = process.argv[2] as keyof typeof moduleMap;
    if (!target || !moduleMap[target]) {
        console.error(`Usage: yarn test:pipeline <target>`);
        console.error(`  where <target> is one of: ${Object.keys(moduleMap).join(', ')}`);
        process.exit(1);
    }
    buildConfig();


    const model = await moduleMap[target].module({ logger: console });
    return await model.send(moduleMap[target].default as any);
}

run().then(console.log).catch(console.error);
