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
