/**
 * Laravel-style Map Collection class
 * Provides collection methods for Map data structures
 */
export class MapCollection<K = any, V = any> {
  private internalMap: Map<K, V>;

  constructor(entries?: Iterable<[K, V]> | Record<string, V>) {
    if (entries && typeof entries === 'object' && !(Symbol.iterator in entries)) {
      this.internalMap = new Map(Object.entries(entries) as [K, V][]);
    } else {
      this.internalMap = new Map(entries as Iterable<[K, V]>);
    }
  }

  /**
   * Create a new map collection instance
   */
  static make<K, V>(entries?: Iterable<[K, V]> | Record<string, V>): MapCollection<K, V> {
    return new MapCollection(entries);
  }

  /**
   * Get all entries as an array of [key, value] pairs
   */
  all(): [K, V][] {
    return Array.from(this.internalMap.entries());
  }

  /**
   * Get the number of items in the map
   */
  count(): number {
    return this.internalMap.size;
  }

  /**
   * Get the number of items in the map (alias for count)
   */
  size(): number {
    return this.internalMap.size;
  }

  /**
   * Determine if the map is empty
   */
  isEmpty(): boolean {
    return this.internalMap.size === 0;
  }

  /**
   * Determine if the map is not empty
   */
  isNotEmpty(): boolean {
    return this.internalMap.size > 0;
  }

  /**
   * Determine if a key exists in the map
   */
  has(key: K): boolean {
    return this.internalMap.has(key);
  }

  /**
   * Get a value from the map by key
   */
  get(key: K, defaultValue?: V): V | undefined {
    return this.internalMap.has(key) ? this.internalMap.get(key) : defaultValue;
  }

  /**
   * Set a value in the map
   */
  set(key: K, value: V): this {
    this.internalMap.set(key, value);
    return this;
  }

  /**
   * Put a value in the map (alias for set)
   */
  put(key: K, value: V): this {
    return this.set(key, value);
  }

  /**
   * Remove a key from the map
   */
  delete(key: K): boolean {
    return this.internalMap.delete(key);
  }

  /**
   * Remove a key from the map (alias for delete)
   */
  forget(key: K): boolean {
    return this.delete(key);
  }

  /**
   * Remove all items from the map
   */
  clear(): this {
    this.internalMap.clear();
    return this;
  }

  /**
   * Get all keys from the map
   */
  keys(): K[] {
    return Array.from(this.internalMap.keys());
  }

  /**
   * Get all values from the map
   */
  values(): V[] {
    return Array.from(this.internalMap.values());
  }

  /**
   * Execute a callback over each item
   */
  each(callback: (value: V, key: K) => void | false): this {
    for (const [key, value] of this.internalMap) {
      if (callback(value, key) === false) {
        break;
      }
    }
    return this;
  }

  /**
   * Run a map over each of the items
   */
  mapValues<U>(callback: (value: V, key: K) => U): MapCollection<K, U> {
    const result = new Map<K, U>();
    this.internalMap.forEach((value, key) => {
      result.set(key, callback(value, key));
    });
    return new MapCollection(result);
  }

  /**
   * Run a filter over each of the items
   */
  filter(callback: (value: V, key: K) => boolean): MapCollection<K, V> {
    const result = new Map<K, V>();
    this.internalMap.forEach((value, key) => {
      if (callback(value, key)) {
        result.set(key, value);
      }
    });
    return new MapCollection(result);
  }

  /**
   * Determine if all items pass the given test
   */
  every(callback: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.internalMap) {
      if (!callback(value, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine if any item passes the given test
   */
  some(callback: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this.internalMap) {
      if (callback(value, key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the first value that passes the given test
   */
  first(callback?: (value: V, key: K) => boolean): V | undefined {
    if (!callback) {
      return this.internalMap.values().next().value;
    }

    for (const [key, value] of this.internalMap) {
      if (callback(value, key)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Get the last value that passes the given test
   */
  last(callback?: (value: V, key: K) => boolean): V | undefined {
    const entries = Array.from(this.internalMap.entries()).reverse();

    if (!callback) {
      return entries[0]?.[1];
    }

    for (const [key, value] of entries) {
      if (callback(value, key)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Reduce the map to a single value
   */
  reduce<U>(callback: (carry: U, value: V, key: K) => U, initial: U): U {
    let carry = initial;
    this.internalMap.forEach((value, key) => {
      carry = callback(carry, value, key);
    });
    return carry;
  }

  /**
   * Merge another map into this one
   */
  merge(other: MapCollection<K, V> | Map<K, V> | Record<string, V>): this {
    if (other instanceof MapCollection) {
      other.each((value, key) => {
        this.set(key, value);
        return undefined;
      });
    } else if (other instanceof Map) {
      other.forEach((value, key) => this.set(key, value));
    } else {
      Object.entries(other).forEach(([key, value]) => {
        this.set(key as K, value as V);
      });
    }
    return this;
  }

  /**
   * Get only the specified keys
   */
  only(keys: K[]): MapCollection<K, V> {
    const result = new Map<K, V>();
    keys.forEach((key) => {
      if (this.internalMap.has(key)) {
        result.set(key, this.internalMap.get(key)!);
      }
    });
    return new MapCollection(result);
  }

  /**
   * Get all items except the specified keys
   */
  except(keys: K[]): MapCollection<K, V> {
    const result = new Map<K, V>();
    this.internalMap.forEach((value, key) => {
      if (!keys.includes(key)) {
        result.set(key, value);
      }
    });
    return new MapCollection(result);
  }

  /**
   * Flip the keys and values
   */
  flip(): MapCollection<V, K> {
    const result = new Map<V, K>();
    this.internalMap.forEach((value, key) => {
      result.set(value, key);
    });
    return new MapCollection(result);
  }

  /**
   * Pass the map to the given callback and return the result
   */
  pipe<U>(callback: (map: MapCollection<K, V>) => U): U {
    return callback(this);
  }

  /**
   * Pass the map to the given callback and then return it
   */
  tap(callback: (map: MapCollection<K, V>) => void): this {
    callback(this);
    return this;
  }

  /**
   * Convert the map to a plain object
   */
  toObject(): Record<string, V> {
    const obj: Record<string, V> = {};
    this.internalMap.forEach((value, key) => {
      obj[String(key)] = value;
    });
    return obj;
  }

  /**
   * Convert the map to an array of [key, value] pairs
   */
  toArray(): [K, V][] {
    return this.all();
  }

  /**
   * Convert the map to JSON
   */
  toJson(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Get the map as a string
   */
  toString(): string {
    return this.toJson();
  }

  /**
   * Get the underlying Map instance
   */
  toMap(): Map<K, V> {
    return new Map(this.internalMap);
  }
}

/**
 * Helper function to create a new map collection
 */
export function collectMap<K, V>(
  entries?: Iterable<[K, V]> | Record<string, V>
): MapCollection<K, V> {
  return new MapCollection(entries);
}
