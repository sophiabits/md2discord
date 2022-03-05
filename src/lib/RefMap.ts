import type { Ref } from '../types';

import isRef from './isRef';

export default class RefMap {
  private _data = new Map<Ref, string>();

  get(idOrRef: string) {
    const resolvedId = this.getOptional(idOrRef);
    if (resolvedId === undefined) {
      throw new Error(`RefMap#get: Could not resolve reference: ${idOrRef}. Aborting deployment.`);
    }

    return resolvedId;
  }

  getOptional(idOrRef: string | undefined) {
    if (!idOrRef) {
      return undefined;
    }

    if (isRef(idOrRef)) {
      const resolvedId = this._data.get(idOrRef);
      if (!resolvedId) {
        return undefined;
      }
      return resolvedId;
    }

    return idOrRef;
  }

  set(ref: string, id: string) {
    console.log(`RefMap#set('${ref}', '${id}')`);
    if (isRef(id)) {
      throw new TypeError('RefMap#set: `id` parameter cannot be a reference.');
    }

    console.log('going to set', ref, '->', id);
    if (isRef(ref)) {
      this._data.set(ref, id);
    }
  }
}
