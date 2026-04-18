/**
 * Laravel-style Set Collection class
 * Provides collection methods for Set data structures
 */
export class SetCollection<T = any> {
  private set: Set<T>;

  constructor(items?: Iterable<T>) {
    this.set = new Set(items);
  }

  /**
   * Create a new set collection instance
   */
  static make<T>(items?: Iterable<T>): SetCollection<T> {
    return new SetCollection(items);
  }

  /**
   * Get all items as an array
   */
  all(): T[] {
    return Array.from(this.set);
  }

  /**
   * Get the number of items in the set
   */
  count(): number {
    return this.set.size;
  }

  /**
   * Get the number of items in the set (alias for count)
   */
  size(): number {
    return this.set.size;
  }

  /**
   * Determine if the set is empty
   */
  isEmpty(): boolean {
    return this.set.size === 0;
  }

  /**
   * Determine if the set is not empty
   */
  isNotEmpty(): boolean {
    return this.set.size > 0;
  }

  /**
   * Determine if an item exists in the set
   */
  has(item: T): boolean {
    return this.set.has(item);
  }

  /**
   * Determine if an item exists in the set (alias for has)
   */
  contains(item: T): boolean {
    return this.has(item);
  }

  /**
   * Add an item to the set
   */
  add(item: T): this {
    this.set.add(item);
    return this;
  }

  /**
   * Add an item to the set (alias for add)
   */
  push(item: T): this {
    return this.add(item);
  }

  /**
   * Remove an item from the set
   */
  delete(item: T): boolean {
    return this.set.delete(item);
  }

  /**
   * Remove an item from the set (alias for delete)
   */
  forget(item: T): boolean {
    return this.delete(item);
  }

  /**
   * Remove all items from the set
   */
  clear(): this {
    this.set.clear();
    return this;
  }

  /**
   * Execute a callback over each item
   */
  each(callback: (item: T, index: number) => void | false): this {
    let index = 0;
    for (const item of this.set) {
      if (callback(item, index++) === false) {
        break;
      }
    }
    return this;
  }

  /**
   * Run a map over each of the items
   */
  map<U>(callback: (item: T, index: number) => U): SetCollection<U> {
    const result = new Set<U>();
    let index = 0;
    this.set.forEach((item) => {
      result.add(callback(item, index++));
    });
    return new SetCollection(result);
  }

  /**
   * Run a filter over each of the items
   */
  filter(callback: (item: T, index: number) => boolean): SetCollection<T> {
    const result = new Set<T>();
    let index = 0;
    this.set.forEach((item) => {
      if (callback(item, index++)) {
        result.add(item);
      }
    });
    return new SetCollection(result);
  }

  /**
   * Determine if all items pass the given test
   */
  every(callback: (item: T, index: number) => boolean): boolean {
    let index = 0;
    for (const item of this.set) {
      if (!callback(item, index++)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine if any item passes the given test
   */
  some(callback: (item: T, index: number) => boolean): boolean {
    let index = 0;
    for (const item of this.set) {
      if (callback(item, index++)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the first item that passes the given test
   */
  first(callback?: (item: T, index: number) => boolean): T | undefined {
    if (!callback) {
      return this.set.values().next().value;
    }

    let index = 0;
    for (const item of this.set) {
      if (callback(item, index++)) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Get the last item that passes the given test
   */
  last(callback?: (item: T, index: number) => boolean): T | undefined {
    const items = Array.from(this.set).reverse();

    if (!callback) {
      return items[0];
    }

    for (let i = 0; i < items.length; i++) {
      if (callback(items[i]!, i)) {
        return items[i];
      }
    }
    return undefined;
  }

  /**
   * Reduce the set to a single value
   */
  reduce<U>(callback: (carry: U, item: T, index: number) => U, initial: U): U {
    let carry = initial;
    let index = 0;
    this.set.forEach((item) => {
      carry = callback(carry, item, index++);
    });
    return carry;
  }

  /**
   * Merge another set into this one
   */
  merge(other: SetCollection<T> | Set<T> | T[]): this {
    if (other instanceof SetCollection) {
      other.each((item) => {
        this.add(item);
        return undefined;
      });
    } else if (other instanceof Set) {
      other.forEach((item) => this.add(item));
    } else {
      other.forEach((item) => this.add(item));
    }
    return this;
  }

  /**
   * Get the union of this set and another
   */
  union(other: SetCollection<T> | Set<T> | T[]): SetCollection<T> {
    const result = new SetCollection(this.set);
    return result.merge(other);
  }

  /**
   * Get the intersection of this set and another
   */
  intersect(other: SetCollection<T> | Set<T> | T[]): SetCollection<T> {
    const otherSet =
      other instanceof SetCollection
        ? other.toSet()
        : other instanceof Set
          ? other
          : new Set(other);

    const result = new Set<T>();
    this.set.forEach((item) => {
      if (otherSet.has(item)) {
        result.add(item);
      }
    });
    return new SetCollection(result);
  }

  /**
   * Get the difference between this set and another
   */
  diff(other: SetCollection<T> | Set<T> | T[]): SetCollection<T> {
    const otherSet =
      other instanceof SetCollection
        ? other.toSet()
        : other instanceof Set
          ? other
          : new Set(other);

    const result = new Set<T>();
    this.set.forEach((item) => {
      if (!otherSet.has(item)) {
        result.add(item);
      }
    });
    return new SetCollection(result);
  }

  /**
   * Get items that are in either set but not in both
   */
  symmetricDiff(other: SetCollection<T> | Set<T> | T[]): SetCollection<T> {
    const otherSet =
      other instanceof SetCollection
        ? other.toSet()
        : other instanceof Set
          ? other
          : new Set(other);

    const result = new Set<T>();

    this.set.forEach((item) => {
      if (!otherSet.has(item)) {
        result.add(item);
      }
    });

    otherSet.forEach((item) => {
      if (!this.set.has(item)) {
        result.add(item);
      }
    });

    return new SetCollection(result);
  }

  /**
   * Determine if this set is a subset of another
   */
  isSubsetOf(other: SetCollection<T> | Set<T> | T[]): boolean {
    const otherSet =
      other instanceof SetCollection
        ? other.toSet()
        : other instanceof Set
          ? other
          : new Set(other);

    for (const item of this.set) {
      if (!otherSet.has(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine if this set is a superset of another
   */
  isSupersetOf(other: SetCollection<T> | Set<T> | T[]): boolean {
    const otherSet =
      other instanceof SetCollection
        ? other.toSet()
        : other instanceof Set
          ? other
          : new Set(other);

    for (const item of otherSet) {
      if (!this.set.has(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Pass the set to the given callback and return the result
   */
  pipe<U>(callback: (set: SetCollection<T>) => U): U {
    return callback(this);
  }

  /**
   * Pass the set to the given callback and then return it
   */
  tap(callback: (set: SetCollection<T>) => void): this {
    callback(this);
    return this;
  }

  /**
   * Convert the set to an array
   */
  toArray(): T[] {
    return this.all();
  }

  /**
   * Convert the set to JSON
   */
  toJson(): string {
    return JSON.stringify(this.all());
  }

  /**
   * Get the set as a string
   */
  toString(): string {
    return this.toJson();
  }

  /**
   * Get the underlying Set instance
   */
  toSet(): Set<T> {
    return new Set(this.set);
  }
}

/**
 * Helper function to create a new set collection
 */
export function collectSet<T>(items?: Iterable<T>): SetCollection<T> {
  return new SetCollection(items);
}
