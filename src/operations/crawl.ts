import fs from 'fs';
import path from 'path';

import Category from '../model/Category';
import Channel from '../model/Channel';

import type { MdCategory } from '../types';

import { CrawlOptions } from './types';

export default async function crawl(opts: CrawlOptions): Promise<MdCategory[]> {
  const { basePath } = opts;

  const directoryPaths = await getDirectories(basePath);

  return Promise.all(
    directoryPaths.map(async (dirPath) => {
      const filePaths = await getFilesList(dirPath, 'md');
      const files = await Promise.all(
        filePaths.map(async (filePath): Promise<Channel> => {
          const content = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

          return Channel.from(getFileName(filePath), content);
        }),
      );

      return new Category({
        children: files,
        title: getFileName(dirPath),
      });
    }),
  );
}

/** Finds all directories within `basePath`, and then returns an array of paths to those subdirectories. */
async function getDirectories(basePath: string): Promise<string[]> {
  return fs.promises
    .readdir(basePath, { withFileTypes: true })
    .then((dirents) =>
      dirents
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(basePath, dirent.name)),
    );
}

/** Lists all files within a directory. */
async function getFilesList(basePath: string, extension: string): Promise<string[]> {
  return fs.promises.readdir(basePath, { withFileTypes: true }).then((dirents) =>
    dirents
      .filter((dirent) => dirent.isFile())
      .filter((dirent) => path.extname(dirent.name) === `.${extension}`)
      .map((dirent) => path.join(basePath, dirent.name)),
  );
}

function getFileName(filePath: string) {
  const basename = path.basename(filePath);
  const extname = path.extname(filePath);

  return basename.slice(0, basename.length - extname.length);
}
