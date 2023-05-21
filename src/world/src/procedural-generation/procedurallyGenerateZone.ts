import { v4 as uuid } from 'uuid';
import { shuffle } from '../../util';
import { gridIterator } from '@curiecode/structurators'
import {
  ExitSkeleton,
  type AreaGenerationConfiguration,
  type GridSize,
  type RoomSkeleton,
} from './types';
import { Flora, FloraType, LoggerContext } from "../../../types";

function randomNumberInBounds(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// export function normalizeGrid<T, K extends keyof T>(grid: Grid, k: K, onNormalize: () => T[K], weight = .5) {
//     for (const cell of grid) {
//         if (cell) {
//             if (weight > Math.random()) {
//                 (cell as T)[k] = onNormalize();
//             }
//         }
//     }
// }

function generateTwoDimensionalArray<T>(size: GridSize, initialContent?: any) {
  return Array(size.y)
    .fill([])
    .map(() =>
      Array(size.x)
        .fill({})
        .map((r) => initialContent ?? {})
    ) as T[][];
}

function populateDefaultTerrain<T extends RoomSkeleton>(
  ctx: LoggerContext,
  map: T[][],
  area: AreaGenerationConfiguration
) {
  for (const cell of gridIterator<T>(map)) {
    // Make it grass:
    // random number between 1 and 3:
    const elevation = randomNumberInBounds(1, 3) as 1 | 2 | 3;
    const newRoom = {
      ...cell.data,
      id: uuid(),
      terrain: area.defaultBiome.defaultTerrain,
      elevation,
      biome: area.defaultBiome.name,
    };
    map[cell.y][cell.x] = newRoom;
  }

  return map;
}

function populateExitData<T extends RoomSkeleton>(
  ctx: LoggerContext,
  map: T[][]
) {
  for (const cell of gridIterator<T>(map)) {
    const exits: Record<string, ExitSkeleton> = {};
    const north = cell.north ? cell.north?.next().value : null;
    const south = cell.south ? cell.south?.next().value : null;
    const east = cell.east ? cell.east?.next().value : null;
    const west = cell.west ? cell.west?.next().value : null;
    if (north && north.data?.id) {
      exits.north = {
        room: north.data.id,
        open: true,
      };
    }
    if (south && south.data?.id) {
      exits.south = {
        room: south.data.id,
        open: true,
      }
    }
    if (east && east.data?.id) {
      exits.east = {
        room: east.data.id,
        open: true,
      }
    }
    if (west && west.data?.id) {
      exits.west = {
        room: west.data.id,
        open: true,
      }
    }

    cell.setProperty('exits', exits);
  }

  return map;
}

function calculateMedianNumber(m: number) {
  return Math.floor(m / 2);
}

function populateBisectingRiver<T extends RoomSkeleton>(
  ctx: LoggerContext,
  map: T[][]
) {
  for (const cell of gridIterator(map, {
    startAt: {y: 0, x: Math.floor(map[0].length / 2)},
    extendTo: {y: 2, x: Math.floor(map[0].length / 2)},
  })) {
    cell.data.terrain = 'water';
    cell.data.biome = 'river';
    cell.data.elevation = 0;
  }
}

function populateFlora<T extends RoomSkeleton>(
  ctx: LoggerContext,
  map: T[][],
  area: AreaGenerationConfiguration
) {
  for (const cell of gridIterator(map)) {
    if (area.defaultBiome.defaultTerrain !== cell.data.terrain) {
      continue;
    }

    const flora: Record<string,
      {
        type: FloraType;
        name: string;
        count: number;
      }> = {};

      if (area.floraTypeProbabilities) {
        for (const floraType in area.floraTypeProbabilities) {
          const floraPropensity = area.floraTypeProbabilities[floraType as FloraType];
          const availableFloraByType = area.defaultBiome.availableFlora.filter(
            (f) => f.type === floraType
          );
          const availableFloraTypeCount = availableFloraByType.length;

          while (floraPropensity > Math.random()) {
            const randomFloraIndex = randomNumberInBounds(
              0,
              availableFloraTypeCount - 1
            );
            const randomFlora = availableFloraByType[randomFloraIndex];
            if (
              !randomFlora ||
              (cell.data.terrain === 'water' &&
                randomFlora.requiresTerrain !== 'water') ||
              (randomFlora.requiresTerrain &&
                randomFlora.requiresTerrain !== cell.data.terrain)
            ) {
              console.log('BOOOO')
              continue;
            }
            console.log('WOOO!!!')
            flora[randomFlora.name] = {
              type: randomFlora.type,
              name: randomFlora.name,
              count: flora[randomFlora.name]?.count
                ? flora[randomFlora.name].count + 1
                : 1,
            };
          }
        }
      }

    console.log('HEre!', flora);
    map[cell.y][cell.x].flora = flora;
  }
}

function smoothFlora(
  ctx: LoggerContext,
  map: RoomSkeleton[][],
  options: {
    depth: number;
    deathTuningFactor: number;
    birthTuningFactor: number;
  }
) {
  const {depth, deathTuningFactor, birthTuningFactor} = options;
  const eventMap: Record<string, number> = {};
  for (let i = 0; i < depth; i++) {
    // const [x, y] = [randomNumberInBounds(0, 2), randomNumberInBounds(0, 2)];
    // Give every tree a chance to compete:
    for (const cell of gridIterator(map)) {
      const roomFlora = cell.data.flora;
      if (!roomFlora) {
        continue;
      }
      for (const flora of shuffle(Object.values(roomFlora))) {
        switch (flora.type) {
          case 'tree':
            for (let i = 0; i < flora.count; i++) {
              for (const otherTree of Object.values(roomFlora).filter(
                (f) => f.type === 'tree' && f.name !== flora.name && f.count > 0
              )) {
                if (deathTuningFactor > Math.random()) {
                  const event = `${flora.name} killed ${otherTree.name}!`;
                  eventMap[event] = eventMap[event] ? eventMap[event] + 1 : 1;
                  (map[cell.y][cell.x]?.flora?.[otherTree.name])!.count--;
                  flora.count++;
                }
              }
            }
            break;
          default:
            break;
        }

        map[cell.y][cell.x].flora[flora.name] = {...flora};
      }
    }

    // Spread the flora to neighbors
    for (const cell of gridIterator(map)) {
      const roomFlora = cell.data.flora;
      if (!roomFlora) {
        continue;
      }
      for (const flora of shuffle(Object.values(roomFlora))) {
        switch (flora.type) {
          case 'tree':
            for (let i = 0; i < flora.count; i++) {
              for (const neighbor of cell.neighbors) {
                if (neighbor == null || !neighbor.data) {
                  continue;
                }
                if (neighbor.data.biome !== cell.data.biome) {
                  continue;
                }
                if (birthTuningFactor > Math.random()) {
                  const event = `${flora.name} reproduced in a neighboring room!`;
                  eventMap[event] = eventMap[event] ? eventMap[event] + 1 : 1;
                  if (neighbor.data.flora[flora.name]) {
                    neighbor.data.flora[flora.name].count++;
                  } else {
                    neighbor.data.flora[flora.name] = {
                      type: flora.type,
                      name: flora.name,
                      count: 1,
                    };
                  }
                  map[neighbor.y][neighbor.x].flora[flora.name] = {
                    ...neighbor.data.flora[flora.name],
                  };
                }
              }
            }
            break;
          default:
            break;
        }
      }
    }

    for (const cell of gridIterator(map)) {
      for (const flora of Object.values(cell.data.flora ?? {})) {
        if (flora.count <= 0) {
          delete map[cell.y][cell.x].flora[flora.name];
          delete cell.data.flora[flora.name];
        }
      }
    }
  }
  for (const event of Object.keys(eventMap)) {
    ctx.logger.info(`${event} (x${eventMap[event]})`);
  }
}

export function procedurallyGenerate(
  ctx: LoggerContext,
  area: AreaGenerationConfiguration,
  size: GridSize
):Array<Array<RoomSkeleton>> {
  ctx.logger.info('Generating zone: ', area.name);
  ctx.logger.info(`Generating ${size.x}x${size.y} map...`);
  const map = generateTwoDimensionalArray<RoomSkeleton>(size);
  ctx.logger.info('Populating default terrain...');
  populateDefaultTerrain(ctx, map, area);
  ctx.logger.info('Populating exit data...');
  populateExitData(ctx, map);
  ctx.logger.info('Populating water...');
  populateBisectingRiver(ctx, map);
  ctx.logger.info('Populating flora...');2
  populateFlora(ctx, map, area);
  ctx.logger.info('Smoothing flora...');
  smoothFlora(ctx, map, {
    depth: area.floraSmoothingDepth,
    deathTuningFactor: area.floraReproduction.death,
    birthTuningFactor: area.floraReproduction.birth,
  });
  ctx.logger.info();
  ctx.logger.info('Finished generating area!');
  return map;
}
