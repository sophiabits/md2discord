import type { Ref } from '../types';

let counter = 0;
export default function uniqueId(tag: string): Ref {
  return `@${tag}/${counter++}`;
}
