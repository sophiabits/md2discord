import _ from 'lodash';
import { APIEmbed, EmbedType } from 'discord-api-types';

import RefMap from '../lib/RefMap';
import Message from '../model/Message';
import {
  Action,
  Change,
  CreateChange,
  DiscordChannelType,
  MessageType,
  Ref,
  UpdateChange,
} from '../types';

import type { DeployOptions } from './types';

const defer = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default async function deploy(opts: DeployOptions) {
  const { changes, discord, guildId } = opts;

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
        await discord.deleteMessage(refMap.get(change.parentId!), change.targetId);
        break;
    }
  }

  // Finished applying changes; now we need to deploy table of contents for each channel we touched
  const seenChannelRefs = new Set<Ref>();
  const promises: Promise<void>[] = [];

  changes.forEach((change) => {
    if (
      change.object === 'channel' &&
      change.op !== Action.Remove &&
      !seenChannelRefs.has(change.ref)
    ) {
      seenChannelRefs.add(change.ref);
      promises.push(handleToc(change.ref));
    }
  });

  await Promise.all(promises);

  async function handleToc(channelRef: Ref) {
    const channelId = refMap.get(channelRef);
    const messageChanges = changes
      .filter((change) => change.object === 'message')
      .filter((change) => change.parentId === channelRef || change.parentId === channelId)
      .filter((change) => change.op === Action.Create || Action.Update);

    // Add h1s to the embed
    const headings: Array<{ id: string; label: string }> = [];
    messageChanges.forEach((change) => {
      const message: Message = (change as CreateChange | UpdateChange).body;
      if (message.type === MessageType.Heading) {
        headings.push({
          id: refMap.get(message.id),
          label: message.children,
        });
      }
    });

    const embed: APIEmbed = {
      fields: headings.map((heading) => ({
        inline: true,
        name: heading.label,
        value: `[Link](https://discord.com/channels/${guildId}/${channelId}/${heading.id})`,
      })),
      title: 'Table of Contents',
      timestamp: new Date().toISOString(),
      type: EmbedType.Rich,
    };

    await discord.createMessage(channelId, {
      embeds: [embed],
    });
  }
}
