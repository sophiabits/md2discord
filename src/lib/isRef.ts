import type { Ref } from '../types';

export default function isRef(value: string): value is Ref {
  return value.startsWith('@') && value.split('/').length === 2;
}
