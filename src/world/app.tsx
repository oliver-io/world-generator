import { render, Text, Box, Newline } from "ink";
import React, { useState, useEffect } from "react";
import { AppContext, createKeyboard, InputBar, KeyboardContext } from '../ui';
import pino from 'pino';
import { generateAreaBiomes, generateAreaData, generateAreaFlora } from "./src/generateAssets";
import { sanitizeFilename } from "./util/files";
import { LoggerContext } from "@curiecode/lamechain";
import parseArgs from 'minimist';
import { generateArea } from './src/procedurallyCreateZone';
import { AreaGenerationConfiguration } from "./src/procedural-generation/types";
import { Biome } from "../types";

function FinishGeneration(props: {
  ctx: LoggerContext,
  areaGenerationConfig: AreaGenerationConfiguration,
  sizeConfiguration: { x: number, y: number },
  folderName: string
}) {
  const [buildingArea, setBuildingArea] = useState<true | false | null>(true);
  useEffect(() => {
    generateArea(
      props.ctx,
      props.areaGenerationConfig,
      props.sizeConfiguration,
      { folderName: `${props.folderName}.area` }
    ).then(() => {
      setBuildingArea(false);
    }).catch(err => {
      props.ctx.logger.error(err);
      setBuildingArea(null);
    });
  });
  if (buildingArea) {
    return <Text>.. Building area ... </Text>;
  } else if (buildingArea === false) {
    return <Text>.. Finished generating!</Text>;
  } else {
    return <Text>.. Error generating area!</Text>;
  }
}

const noGenText = <Text color="grey">.. Nothing generated yet, please continue with the CLI </Text>;

function summarizeArea(area?: Awaited<ReturnType<typeof generateAreaData>>) {
  return area ? `.. [${area.name}]: ${area.description}` : noGenText;
}

function summarizeBiomes(biomes?: Awaited<ReturnType<typeof generateAreaBiomes>>) {
  return biomes ?
    '.. ' + biomes.map(biome => `[${biome.name}]: (${[biome.defaultTerrain, ...biome.commonTerrain ?? []].join(',')}) ${biome.description}`).join('\n')
    : noGenText;
}

function summarizeFlora(flora?: Awaited<ReturnType<typeof generateAreaFlora>>) {
  return flora ? <Text>.. {flora.map(flora => `${flora.name} (${flora.scientificName})`).join(', ')}</Text> : noGenText;
}

type GenState = {
  name?: string,
  area?: any,
  biomes?: any,
  flora?: any,
  generating?: boolean,
  confirmed?: boolean
  progress?: string
};

export function App() {
  const cliArgs = parseArgs(process.argv);
  const folderName = sanitizeFilename(cliArgs.name || Date.now().toString())
  const [genState, setGenState] = useState<GenState>({
    name: folderName
  });
  const { area, biomes, flora, generating = false, name = folderName, confirmed } = genState;
  const logger = pino(
    pino.transport({
      target: 'pino/file',
      options: { destination: `.generated_content/${name}.area/LOG.txt`, mkdir: true },
    })
  );
  const loggerContext: LoggerContext = {
    logger
  };

  const keyboard = createKeyboard();
  const hasArea = !!area;
  const hasBiomes = !!biomes;
  const hasFlora = !!flora;
  const isFinished = hasArea && hasBiomes && hasFlora;

  let prompt: string | ReturnType<typeof Text> = 'Unknown state';
  if (!hasArea) {
    prompt = <Text bold>What kind of area do you want to create?</Text>;
  } else if (!hasBiomes) {
    prompt = 'Are there any specific biomes you want to see?'
  } else if (!hasFlora) {
    prompt = 'Are there any specific flora you want to see?'
  } else {
    prompt = <Text bold>Does the generated content look correct?<Newline /> <Text color="red" underline italics bold>Upon confirmation, the world will be generated.</Text></Text>
  }

  async function setLoadingGenState(fn: () => Promise<GenState>) {
    setGenState({
      ...genState,
      generating: true,
      progress: ''
    });
    fn().then((newState) => {
      setGenState({
        ...genState,
        ...newState,
        generating: false,
        progress: ''
      });
    });
  }

  const {
    sfloraf: floraSmoothingFactor = 0.5,
    sflorad: floraSmoothingDepth = 0.5,
    sbiomef: biomeSmoothingFactor = 0.5,
    sbiomed: biomeSmoothingDepth = 0.5,
    slandf:  landSmoothingFactor = 0.5,
    slandd: landSmoothingDepth = .5,
    landX = cliArgs.width ?? 3,
    landY = cliArgs.height ?? 3
  } = cliArgs;

  if (genState.confirmed) {
    const config: AreaGenerationConfiguration = {
      name,
      description: area.description,
      defaultBiome: {
        availableFlora: flora,
        floraReproduction: {
          birth: 0.5,
          death: 0.5
        },
        floraSmoothingDepth: 2,
        floraIndividualProbabilities: {},
        floraTypeProbabilities: {
          bush: 0.5,
          tree: 0.5,
          fern: 0.5,
          grass: 0.5,
          flower: 0.5,
          vine: 0.5,
          fungus: 0.5,
          lichen: 0.5,
          moss: 0.5,
          succulent: 0.5
        },
        ...(biomes[0] as Biome),
      },
      availableBiomes: (biomes as Biome[]).map(biome=>{
        return  {
          availableFlora: flora,
          floraReproduction: {
            birth: 0.5,
            death: 0.5
          },
          floraSmoothingDepth: 2,
          floraIndividualProbabilities: {},
          floraTypeProbabilities: {
            bush: 0.5,
            tree: 0.5,
            fern: 0.5,
            grass: 0.5,
            flower: 0.5,
            vine: 0.5,
            fungus: 0.5,
            lichen: 0.5,
            moss: 0.5,
            succulent: 0.5
          },
          ...biome,
        }
      }),
      floraReproduction: floraSmoothingFactor,
      floraSmoothingDepth,
      biomeIndividualProbabilities: {},
      floraIndividualProbabilities: {},
      floraTypeProbabilities: {
        bush: 0.5,
        tree: 0.5,
        fern: 0.5,
        grass: 0.5,
        flower: 0.5,
        vine: 0.5,
        fungus: 0.5,
        lichen: 0.5,
        moss: 0.5,
        succulent: 0.5
      }
    };

    return <FinishGeneration 
      ctx={loggerContext}
      areaGenerationConfig={config}
      sizeConfiguration={{ x: landX, y: landY }}
      folderName={folderName}
    />;
  }

  return <>
    <AppContext.Provider value={{
      height: 100, width: 100, logger: loggerContext.logger, config: { environment: 'generator' }
    }}>
      <KeyboardContext.Provider value={keyboard}>
        <Box height="100%" width="100%" flexDirection="column" borderStyle="single">
          <Text> {generating ? <Newline /> : null}{generating ? ` . . . (Generating${genState.progress ? ' ' + genState.progress : ''})` : prompt}{generating ? <Newline /> : null}</Text>
          {generating ? null : <InputBar hint={isFinished ? "press enter to confirm, or type no to start over" : "type here . . . "} onSubmit={async (message) => {
            if (!hasArea) {
              await setLoadingGenState(async () => ({
                area: await generateAreaData(loggerContext, {
                  prompt: message.input,
                  folderName: name
                })
              }));
            } else if (!hasBiomes) {
              await setLoadingGenState(async () => ({
                biomes: await generateAreaBiomes(loggerContext, {
                  area: genState.area,
                  prompt: message.input,
                  folderName: name
                })
              }));
            } else if (!hasFlora) {
              await setLoadingGenState(async () => ({
                flora: await generateAreaFlora(loggerContext, {
                  area: genState.area,
                  biomes: genState.biomes,
                  prompt: message.input,
                  folderName: name,
                }, (stage) => {
                  setGenState((current) => ({
                    ...genState,
                    ...current,
                    generating: true,
                    progress: stage
                  }));
                })
              }));
            } else if (isFinished) {
              return setGenState((current) => ({
                ...genState,
                ...current,
                generating: false,
                confirmed: true
              }));
            }
          }} />}
          <Newline />
          <Text italic> Current generated content: </Text>
          <Box borderStyle="double" flexDirection={"column"} paddingX={1}>
            <Text><Text bold>- Height x Width</Text>:  <Text bold>{cliArgs.x || 3}</Text> x <Text bold>{cliArgs.y || 3}</Text> [<Text bold>{(cliArgs.x || 3) * (cliArgs.y || 3)}</Text> rooms total]</Text>
            <Text><Text bold>- Land Smoothing</Text>:  factor: <Text bold>{cliArgs.slandf || .5}</Text>, depth: <Text bold>{cliArgs.slandd || 2}</Text></Text>
            <Text><Text bold>- Biome Smoothing</Text>: factor: <Text bold>{cliArgs.sbiomesf || .5}</Text>, depth: <Text bold>{cliArgs.sbiomesd || 2}</Text></Text>
            <Text><Text bold>- Flora Smoothing</Text>: factor: <Text bold>{cliArgs.sfloraf || .5}</Text>, depth: <Text bold>{cliArgs.sflorad || 2}</Text></Text>
            <Text><Text bold>- Flora Counts</Text>:    factor: <Text bold>{cliArgs.sfloraf || .5}</Text>, depth: <Text bold>{cliArgs.sflorad || 2}</Text></Text>
            <Text><Text bold>- Area</Text>: ........{summarizeArea(area)}</Text>
            <Text><Text bold>- Biomes ({cliArgs.nbiomes ?? 1})</Text>: ..{summarizeBiomes(biomes)}</Text>
            <Text><Text bold>- Flora ({(cliArgs.nbiomesflora ?? 3) * (cliArgs.nbiomes ?? 1)})</Text>: ...{summarizeFlora(flora)}</Text>
          </Box>
        </Box>
      </KeyboardContext.Provider>
    </AppContext.Provider>
  </>
}

export async function renderApp() {
  render(<App />);
}

renderApp().then().catch(console.error);