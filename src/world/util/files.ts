import { Logger } from '../../types';
import { existsSync, promises as fs } from 'fs';

export async function maybeLoadOrGenerate<T>(
  fn: () => T | Promise<T>,
  options: {
    filename: string;
    folderName?: string
  },
  config: {
    logger: Logger,
    REGENERATE: boolean;
  }
):Promise<T> {
  const { filename, folderName } = options;
  if (!existsSync(`./.generated_content/${folderName}`)) {
    await fs.mkdir(`./.generated_content/${folderName}`);
  }
  const filePath = `./.generated_content/${folderName ? folderName + '/' : ''}${sanitizeFilename(filename)}.json`.replace(/\/\//g, '/');
  let fileData: T | null;
  try {
    fileData = JSON.parse((await fs.readFile(filePath)).toString());
  } catch (err) {
    fileData = null;
  }
  if (!fileData || config.REGENERATE) {
    config.logger.info('Generating from scratch');
    const data = await fn();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return data;
  } else if (fileData) {
    config.logger.info('Loading from disk');
    return fileData;
  } else {
    throw new Error('This should never happen');
  }
}

export function sanitizeFilename(input: string): string {
  // Replace all runs of whitespace characters with a single underscore
  const sanitized = input.replace(/\s+/g, '_');

  // Remove all non-alphanumeric characters except underscores
  const alphanumericRegex = /[^\w_]/g;
  const result = sanitized.replace(alphanumericRegex, '');

  return result;
}
