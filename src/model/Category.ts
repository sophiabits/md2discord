import type { MdCategory, MdChannel } from '../types';

import uniqueId from '../lib/uniqueId';

interface CategoryConstructorParams {
  children: MdChannel[];
  title: string;
}

export default class Category implements MdCategory {
  public id = uniqueId('category');

  public children!: MdChannel[];
  public title!: string;

  constructor(params: CategoryConstructorParams) {
    Object.assign(this, params);
  }
}
