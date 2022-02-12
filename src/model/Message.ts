import { MdMessage, MessageType } from '../types';

interface MessageConstructorParams {
  type: MessageType;
  children: string;
}

export default class Message implements MdMessage {
  public type!: MessageType;
  public children!: string;

  constructor(params: MessageConstructorParams) {
    Object.assign(this, params);
  }

  /** Parses a markdown string into an array of Messages */
  static parse(content: string): Message[] {
    const lines = content.split('\n');
    const messages: Message[] = [];

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

    return messages;
  }

  toMarkdown() {
    switch (this.type) {
      case MessageType.Heading:
        return `> __**${this.children}**__`;

      case MessageType.Subheading:
        return `__**${this.children}**__`;

      default:
        return this.children;
    }
  }
}
