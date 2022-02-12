import type { APIMessage } from 'discord-api-types/v9';

import Category from '../model/Category';
import Channel from '../model/Channel';
import Message from '../model/Message';

import Discord from '../Discord';

import { Action, Change } from '../types';
import type { ReconcileOptions } from './types';

/**
 * Reconciles a crawled document tree against the target Discord server
 * and produces a list of Changes which should be applied in order to
 * make the server's state match the crawled tree.
 */
export default async function reconcile(opts: ReconcileOptions) {
  const { docs, discord } = opts;

  const changes: Change[] = [];

  // First, figure out what we need to do for each category
  for (let i = 0; i < docs.length; i++) {
    await reconcileCategory(discord, docs[i], changes);
  }

  // Now figure out the channels
  for (let i = 0; i < docs.length; i++) {
    for (let j = 0; j < docs[i].children.length; j++) {
      await reconcileChannel(discord, docs[i], docs[i].children[j], changes);
    }
  }

  // Now the messages
  for (let i = 0; i < docs.length; i++) {
    for (let j = 0; j < docs[i].children.length; j++) {
      const channel = docs[i].children[j];
      const apiChannel = await discord.findChannelByName(channel.title);
      const messages = apiChannel ? await discord.listMessages(apiChannel.id) : [];

      await reconcileMessages(messages, docs[i].children[j].children, channel, changes);
    }
  }

  return changes;
}

async function reconcileCategory(discord: Discord, category: Category, changes: Change[]) {
  const cachedApiCategory = await discord.findChannelByName(category.title);

  if (!cachedApiCategory) {
    changes.push({
      op: Action.Create,
      object: 'category',
      body: category,
    });
  }
}

async function reconcileChannel(
  discord: Discord,
  parent: Category,
  channel: Channel,
  changes: Change[],
) {
  const cachedApiChannel = await discord.findChannelByName(channel.title);

  if (cachedApiChannel) {
    // We need to eagerly add an update in case we're changing parent
    changes.push({
      op: Action.Update,
      object: 'channel',
      body: channel,

      targetId: cachedApiChannel.id,
      parentId: parent.id,
    });
  } else {
    changes.push({
      op: Action.Create,
      object: 'channel',
      body: channel,

      parentId: parent.id,
    });
  }
}

async function reconcileMessages(
  current: APIMessage[],
  messages: Message[],
  parent: Channel,
  changes: Change[],
) {
  messages.forEach((message, index) => {
    if (index < current.length - 1) {
      changes.push({
        op: Action.Update,
        object: 'message',
        parentId: parent.id,
        targetId: current[index].id,
        body: message,
      });
    } else {
      changes.push({
        op: Action.Create,
        object: 'message',
        parentId: parent.id,
        body: message,
      });
    }
  });

  // Delete any extra messages we have left over at the end
  for (let i = current.length; i < messages.length; i++) {
    changes.push({
      op: Action.Remove,
      object: 'message',
      parentId: parent.id,
      targetId: current[i].id,
    });
  }
}
