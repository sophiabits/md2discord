export enum Action {
  Create,
  Update,
  Remove,
}

export type Ref = `@${string}/${string}`;

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
  id: Ref;
  children: MdChannel[];
  title: string;
}

export interface MdChannel {
  id: Ref;
  children: MdMessage[];
  description: string;
  title: string;
}

export interface MdMessage {
  id: Ref;
  type: MessageType;
  children: string;

  toMarkdown(): string;
}
