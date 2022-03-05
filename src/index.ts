import 'dotenv/config';

import path from 'path';
import Discord from './Discord';

import crawl from './operations/crawl';
import deploy from './operations/deploy';
import reconcile from './operations/reconcile';

async function main() {
  const discord = new Discord(process.env.DISCORD_TOKEN!, process.env.GUILD_ID!);

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
  });

  console.log('deployed!');
}
main();
