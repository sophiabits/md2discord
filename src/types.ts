export enum Action {
  Create = 'Create',
  Update = 'Update',
  Remove = 'Remove',
}

export type Ref = `@${string}/${string}`;

interface CreateOrUpdateChange {
  op: Action.Create | Action.Update;
  object: string;
  parentId?: Ref | string;
  targetId?: string;
  body: any;
}

export interface RemoveChange {
  op: Action.Remove;
  object: string;
  parentId?: string;
  targetId: string;
}

export type Change = CreateOrUpdateChange | RemoveChange;

export enum MessageType {
  Heading = 'Heading',
  Subheading = 'Subheading',
  Body = 'Body',
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

/**
 * Type which represents (optional) frontmatter metadata which can be
 * specified inside a Markdown document.
 */
export interface MdMatter {
  description?: string;
}

export interface MdMessage {
  id: Ref;
  type: MessageType;
  children: string;

  toMarkdown(): string;
}
