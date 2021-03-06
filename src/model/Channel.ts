import frontmatter from 'front-matter';

import { MdChannel, MdMatter, MdMessage, MessageType } from '../types';

import uniqueId from '../lib/uniqueId';

import Message from './Message';

interface ChannelConstructorParams {
  description: string;
  title: string;
  children: MdMessage[];
}

export default class Channel implements MdChannel {
  public id = uniqueId('channel');

  public description!: string;
  public title!: string;
  public children!: MdMessage[];

  constructor(params: ChannelConstructorParams) {
    Object.assign(this, params);
  }

  /** Parses a markdown string into a Channel */
  static from(title: string, content: string): Channel {
    const matter = frontmatter<MdMatter>(content);

    const lines = matter.body.split('\n');
    const messages: Message[] = [];

    // Keeps track of current message content
    let cursor: string[] = [];

    // Start new message
    const push = () => {
      if (cursor.length > 0) {
        messages.push(
          new Message({
            children: cursor.join('\n'),
            type: MessageType.Body,
          }),
        );
        cursor = [];
      }
    };

    lines.forEach((line) => {
      if (line === '.') {
        push();
      } else if (line.startsWith('##')) {
        push();
        messages.push(
          new Message({
            type: MessageType.Subheading,
            children: line.slice(2).trim(),
          }),
        );
      } else if (line.startsWith('#')) {
        push();
        messages.push(
          new Message({
            type: MessageType.Heading,
            children: line.slice(1).trim(),
          }),
        );
      } else {
        cursor.push(line);
      }
    });

    // Handle any trailing messages
    push();

    return new Channel({
      title,
      description: matter.attributes?.description || '',
      children: messages,
    });
  }
}
