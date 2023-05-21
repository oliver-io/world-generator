import { buildConfig } from "../util";
import { maybeLoadOrGenerate, sanitizeFilename } from "../util/files";
import { AreaData, Entity, GameMap, LoggerContext } from "../../types";
import { procedurallyGenerate } from "./procedural-generation/procedurallyGenerateZone";
import { transformTemplatesToOpenAIResponses } from "./procedural-generation/openAI/generateOpenAIData";
import {
  AreaGenerationConfiguration,
  EntityGenerationConfiguration,
  GridSize,
  NPCSkeleton
} from "./procedural-generation/types";
import { promises as fs } from "fs";
import { buildOpenAITemplates, createPromptData, mapOpenAIResponseToRooms } from "./procedural-generation";
import { generateNPCs } from "./procedural-generation/npcs/procedurallyGenerateNPC";

export async function maybeCreateFolder(folderName: string) {
  try {
    await fs.readdir(`./.generated_content/${folderName}`);
  } catch (err) {
    await fs.mkdir(`./.generated_content/${folderName}`);
  }
}

export async function generateArea(
  ctx: LoggerContext,
  area: AreaGenerationConfiguration,
  size: GridSize,
  fileData: {
    folderName: string
  }
): Promise<GameMap> {
  const config = buildConfig(ctx.logger);
  const map = await maybeLoadOrGenerate(
    () =>
      procedurallyGenerate(
        ctx,
        area,
        size
      ),
    {
      ...fileData,
      filename: `skeleton`,
    },
    config
  );

  const prompts = await maybeLoadOrGenerate(
    async () => await createPromptData(area, map),
    {
      ...fileData,
      filename: `prompts`,
    },
    config
  );

  const templates = await maybeLoadOrGenerate(
    async () => await buildOpenAITemplates(prompts),

    {
      ...fileData,
      filename: `convos`,
    },
    config
  );

  const generatedRoomContent = await maybeLoadOrGenerate(
    async () => await transformTemplatesToOpenAIResponses(config, templates),

    {
      ...fileData,
      filename: `descriptions`,
    },
    config
  );

  const generatedRooms = await maybeLoadOrGenerate(
    async () =>
      await mapOpenAIResponseToRooms(generatedRoomContent, map.flat()),

    {
      ...fileData,
      filename: `rooms`,
    },
    config
  );

  if (area.entities) {
    await maybeLoadOrGenerate(
      async () => await generateNPCs([
        {skeleton: area.entities?.availableEntities!, num: 1}
      ]),
      {
        ...fileData,
        filename: `npcs`,
      },
      config
    );
  }

  return {} as any; //TODO: fix
}
