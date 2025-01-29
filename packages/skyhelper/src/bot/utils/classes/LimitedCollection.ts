import { Collection } from "@discordjs/collection";

export interface LimitedCollectionOptions<Key, Value> {
  maxSize?: number;
  keepOverLimit?: (value: Value, key: Key, collection: LimitedCollection<Key, Value>) => boolean;
}
export class LimitedCollection<K, V> extends Collection<K, V> {
  maxSize: number;
  public keepOverLimit: ((value: V, key: K, collection: this) => boolean) | null;
  constructor(options: LimitedCollectionOptions<K, V> = {}, iterable?: Iterable<readonly [K, V]>) {
    super(iterable);
    const { maxSize = Infinity, keepOverLimit = null } = options;
    /**
     * The max size of the Collection.
     * @type {number}
     */
    this.maxSize = maxSize;

    /**
     * A function called to check if an entry should be kept when the Collection is at max size.
     * @type {?Function}
     */
    this.keepOverLimit = keepOverLimit;
  }

  public override set(key: K, value: V) {
    if (this.maxSize === 0 && !this.keepOverLimit?.(value, key, this)) return this;
    if (this.size >= this.maxSize && !this.has(key)) {
      for (const [k, v] of this.entries()) {
        const keep = this.keepOverLimit?.(v, k, this) ?? false;
        if (!keep) {
          this.delete(k);
          break;
        }
      }
    }
    return super.set(key, value);
  }

  static get [Symbol.species]() {
    return Collection;
  }
}
