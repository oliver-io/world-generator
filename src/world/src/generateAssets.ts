import { AreaData, Biome, Flora, FloraType, floraTypeValues, LoggerContext, terrainTypeValues } from '../../types';
import { buildConfig } from '../util/config'
import { buildAreaGenModel } from './models/areaModel';
import { buildBiomeGenModel } from './models/biomeModel';
import { buildFloraGenModel } from './models/floraModel';
import { sanitizeFilename, maybeLoadOrGenerate } from "../util/files";

type GenerationOptions = {
  prompt: string,
  folderName?: string
  biomesPerArea?: number,
  floraPerBiome?: number,
  floraMinima?: Partial<Record<FloraType, number>>,
  biomesMinima?: Array<string>
};

export async function generateAreaData(ctx: LoggerContext, options: GenerationOptions):Promise<AreaData> {
  const {
    prompt,
    folderName = 'generated',
  } = options ?? {};
  const fsOptions = { folderName: sanitizeFilename(folderName) + '.area' }
  const config = buildConfig(ctx.logger);
  const generateArea = async () => {
    const areaModel = await buildAreaGenModel(ctx);
    ctx.logger.info({ prompt }, 'SENDING!')
    const area = await areaModel.send({ prompt });
    return area as AreaData;
  };

  return await maybeLoadOrGenerate(
    generateArea,
    { ...fsOptions, filename: 'area' },
    config
  );
}


export async function generateAreaBiomes(ctx: LoggerContext, options: GenerationOptions & { area: AreaData }):Promise<Biome[]> {
  const {
    prompt,
    folderName = 'generated',
    biomesPerArea = 1,
    floraPerBiome = 3,
  } = options ?? {};
  const fsOptions = { folderName: sanitizeFilename(folderName) + '.area' }
  const config = buildConfig(ctx.logger);

  const generateBiomes = async (area: AreaData) => {
    const biomeModel = await buildBiomeGenModel(ctx);
    let biomes = [];
    for (let i = 0; i < biomesPerArea; i++) {
      const generatedBiome = await biomeModel.send({
        ...area,
        possibleTerrainTypes: terrainTypeValues.join(','),
        biomeRequest: ''
      });
      biomes.push(generatedBiome);
    }
    return biomes;
  };

  return await maybeLoadOrGenerate(
    () => generateBiomes(options.area),
    { ...fsOptions, filename: 'biomes' },
    config
  );
}

export async function generateAreaFlora(ctx: LoggerContext, options: GenerationOptions & { area: AreaData, biomes: Biome[] }, onProgress?: (f: string)=>void):Promise<Flora[]> {
  const {
    prompt,
    folderName = 'generated',
    biomesPerArea = 1,
    floraPerBiome = 3,
  } = options ?? {};
  const fsOptions = { folderName: sanitizeFilename(folderName) + '.area' }
  const config = buildConfig(ctx.logger);
  const generateFlora = async (biomes: Array<Biome>) => {
    if (onProgress) { onProgress('(training phase)') }
    let floraModel = await buildFloraGenModel(ctx);
    if (onProgress) { onProgress('flora....') }
    let flora: Array<Flora> = [];
    let current:Flora;
    for (let i = 0; i < biomes.length; i++) {
      for (let j = 0; j < floraPerBiome; j++) {
        current = await floraModel.send({
          ...biomes[i],
          possibleFloraTypes: floraTypeValues.join(', ')
        });
        if (onProgress) { onProgress(current.name) };
        flora.push(current);
      }
      if (options?.floraMinima) {
        for (const floraType in options.floraMinima) {
          const floraCount = flora.filter((f: Flora) => f.type === floraType).length;
          for (let j = floraCount; j < options.floraMinima![floraType as FloraType]!; j++) {
            current = await floraModel.send({
              ...biomes[i],
              possibleFloraTypes: floraType
            });
            if (onProgress) { onProgress(current.name) };
            flora.push(current);
          }
        }
      }
    }
    return flora;
  };

  return await maybeLoadOrGenerate(
    () => generateFlora(options.biomes),
    { ...fsOptions, filename: 'flora' },
    config
  );
}
