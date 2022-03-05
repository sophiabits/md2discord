import RefMap from '../lib/RefMap';
import { Action, Change, DiscordChannelType } from '../types';

import type { DeployOptions } from './types';

export default async function deploy(opts: DeployOptions) {
  const { changes, discord } = opts;

  const refMap = new RefMap();

  for (let i = 0; i < changes.length; i++) {
    // Execute the change
    const change = changes[i];
    switch (change.object) {
      case 'category':
        await handleCategory(change);
        break;
      case 'channel':
        await handleChannel(change);
        break;
      case 'message':
        await handleMessage(change);
        break;
    }
  }

  // TODO: Table of contents

  async function handleCategory(change: Change) {
    switch (change.op) {
      case Action.Create:
        {
          const category = await discord.createChannel({
            description: change.body.description,
            name: change.body.title,
            type: DiscordChannelType.Category,
          });
          refMap.set(change.ref, category.id);
        }
        break;

      case Action.Update:
        {
          const category = await discord.updateChannel({
            description: change.body.description,
            id: refMap.get(change.targetId!),
            parent: refMap.getOptional(change.parentId),
          });
          refMap.set(change.targetId!, category.id);
        }
        break;

      case Action.Remove:
        await discord.deleteChannel(change.targetId);
        break;
    }
  }

  async function handleChannel(change: Change) {
    switch (change.op) {
      case Action.Create:
        {
          const channel = await discord.createChannel({
            description: change.body.description,
            name: change.body.title,
            parent: refMap.get(change.parentId!),
            type: DiscordChannelType.Text,
          });
          refMap.set(change.ref, channel.id);
        }
        break;

      case Action.Update:
        {
          const channel = await discord.updateChannel({
            description: change.body.description,
            id: refMap.get(change.targetId!),
            parent: refMap.getOptional(change.parentId),
          });
          refMap.set(change.ref, channel.id);
        }
        break;

      case Action.Remove:
        await discord.deleteChannel(change.targetId);
        break;
    }
  }

  async function handleMessage(change: Change) {
    switch (change.op) {
      case Action.Create:
        {
          const message = await discord.createMessage(refMap.get(change.parentId!), {
            content: change.body.toMarkdown(),
          });
          refMap.set(change.ref, message.id);
        }
        break;

      case Action.Update:
        {
          const channel = await discord.updateMessage(
            refMap.get(change.parentId!),
            refMap.get(change.targetId),
            {
              content: change.body.toMarkdown(),
            },
          );
          refMap.set(change.ref, channel.id);
        }
        break;

      case Action.Remove:
        await discord.deleteChannel(change.targetId);
        break;
    }
  }
}
