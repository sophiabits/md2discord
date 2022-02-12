import type { MdChannel, MdMessage } from '../types';

interface ChannelConstructorParams {
  title: string;
  children: MdMessage[];
}

export default class Channel implements MdChannel {
  public title!: string;
  public children!: MdMessage[];

  constructor(params: ChannelConstructorParams) {
    Object.assign(this, params);
  }
}
