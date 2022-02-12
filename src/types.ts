export enum Action {
  Create,
  Update,
  Remove,
}

export interface Change {
  type: Action;
  resourceId: string;
}

export enum MessageType {
  Heading,
  Subheading,
  Body,
}

export interface MdCategory {
  children: MdChannel[];
  title: string;
}

export interface MdChannel {
  children: MdMessage[];
  description: string;
  title: string;
}

export interface MdMessage {
  type: MessageType;
  children: string;

  toMarkdown(): string;
}
