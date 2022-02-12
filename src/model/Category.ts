import type { MdCategory, MdChannel } from '../types';

interface CategoryConstructorParams {
  children: MdChannel[];
  title: string;
}

export default class Category implements MdCategory {
  public children!: MdChannel[];
  public title!: string;

  constructor(params: CategoryConstructorParams) {
    Object.assign(this, params);
  }
}
