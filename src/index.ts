import path from 'path';

import crawl from './operations/crawl';

async function main() {
  const docs = await crawl({
    basePath: path.resolve(path.join(__dirname, '..', 'docs')),
  });
}
main();
