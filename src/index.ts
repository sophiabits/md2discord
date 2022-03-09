import 'dotenv/config';

import path from 'path';

import Discord from './Discord';
import config from './config';

import crawl from './operations/crawl';
import deploy from './operations/deploy';
import reconcile from './operations/reconcile';

async function main() {
  const discord = new Discord(config.discordToken, config.guildId);

  const docs = await crawl({
    basePath: path.resolve(path.join(__dirname, '..', 'docs')),
  });

  const plan = await reconcile({
    docs,
    discord,
  });

  console.log('plan:', plan);

  await deploy({
    changes: plan,
    discord,
    guildId: config.guildId,
  });

  console.log('deployed!');
}
main();
