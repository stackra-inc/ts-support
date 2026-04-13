/**
 * Laravel-style Collection class for arrays
 * Wraps collect.js for Laravel-compatible collection operations
 */
import collectJs, { Collection as CollectJsCollection } from "collect.js";

export class Collection<T = any> {
  private collection: CollectJsCollection<T>;

  constructor(items: T[] = []) {
    this.collection = collectJs(items);
  }

  /**
   * Create a new collection instance
   */
  static make<T>(items: T[] = []): Collection<T> {
    return new Collection(items);
  }

  /**
   * Get all items in the collection
   */
  all(): T[] {
    return this.collection.all();
  }

  /**
   * Get the average value of a given key
   */
  avg(key?: keyof T | ((item: T) => number)): number {
    return this.collection.avg(key as any);
  }

  /**
   * Chunk the collection into chunks of the given size
   */
  chunk(size: number): Collection<T[]> {
    return new Collection(this.collection.chunk(size).all());
  }

  /**
   * Collapse a collection of arrays into a single, flat collection
   */
  collapse(): Collection<any> {
    return new Collection(this.collection.collapse().all());
  }

  /**
   * Determine if an item exists in the collection
   */
  contains(key: keyof T | ((item: T) => boolean), value?: any): boolean {
    return this.collection.contains(key as any, value);
  }

  /**
   * Get the total number of items in the collection
   */
  count(): number {
    return this.collection.count();
  }

  /**
   * Get the items in the collection that are not present in the given items
   */
  diff(items: T[]): Collection<T> {
    return new Collection(this.collection.diff(items).all());
  }

  /**
   * Execute a callback over each item
   */
  each(callback: (item: T, key: number) => void | false): this {
    this.collection.each(callback as any);
    return this;
  }

  /**
   * Determine if all items pass the given test
   */
  every(callback: (item: T, key: number) => boolean): boolean {
    return this.collection.every(callback as any);
  }

  /**
   * Get all items except for those with the specified keys
   */
  except(keys: (keyof T)[]): Collection<T> {
    return new Collection(this.collection.except(keys as any).all());
  }

  /**
   * Run a filter over each of the items
   */
  filter(callback?: (item: T, key: number) => boolean): Collection<T> {
    return new Collection(this.collection.filter(callback as any).all());
  }

  /**
   * Get the first item from the collection
   */
  first(callback?: (item: T, key: number) => boolean): T | undefined {
    return this.collection.first(callback as any);
  }

  /**
   * Get a flattened array of the items in the collection
   */
  flatten(depth?: number): Collection<any> {
    return new Collection(this.collection.flatten(depth).all());
  }

  /**
   * Flip the items in the collection
   */
  flip(): Collection<any> {
    return new Collection(this.collection.flip().all());
  }

  /**
   * Remove an item from the collection by key
   */
  forget(key: number): this {
    this.collection.forget(key);
    return this;
  }

  /**
   * Get an item from the collection by key
   */
  get(key: number, defaultValue?: T): T | undefined {
    const result = this.collection.get(key, defaultValue as any);
    return result === null ? undefined : result;
  }

  /**
   * Group the collection's items by a given key
   */
  groupBy(key: keyof T | ((item: T) => any)): Collection<Collection<T>> {
    const grouped = this.collection.groupBy(key as any);
    const result: any = {};
    grouped.each((items: any, groupKey: any) => {
      result[groupKey] = new Collection(items.all());
    });
    return new Collection(Object.values(result));
  }

  /**
   * Determine if a given key exists in the collection
   */
  has(key: number): boolean {
    return this.collection.has(key);
  }

  /**
   * Concatenate values of a given key as a string
   */
  implode(key: keyof T | string, glue?: string): string {
    return this.collection.implode(key as any, glue);
  }

  /**
   * Intersect the collection with the given items
   */
  intersect(items: T[]): Collection<T> {
    return new Collection(this.collection.intersect(items).all());
  }

  /**
   * Determine if the collection is empty
   */
  isEmpty(): boolean {
    return this.collection.isEmpty();
  }

  /**
   * Determine if the collection is not empty
   */
  isNotEmpty(): boolean {
    return this.collection.isNotEmpty();
  }

  /**
   * Join all items from the collection using a string
   */
  join(glue: string, finalGlue?: string): string {
    if (finalGlue) {
      return (this.collection as any).join(glue, finalGlue);
    }
    return (this.collection as any).join(glue);
  }

  /**
   * Key the collection by the given key
   */
  keyBy(key: keyof T | ((item: T) => any)): Collection<T> {
    return new Collection(this.collection.keyBy(key as any).all() as T[]);
  }

  /**
   * Get the keys of the collection items
   */
  keys(): Collection<string | number> {
    return new Collection(this.collection.keys().all() as (string | number)[]);
  }

  /**
   * Get the last item from the collection
   */
  last(callback?: (item: T, key: number) => boolean): T | undefined {
    return this.collection.last(callback as any);
  }

  /**
   * Run a map over each of the items
   */
  map<U>(callback: (item: T, key: number) => U): Collection<U> {
    return new Collection(this.collection.map(callback as any).all() as U[]);
  }

  /**
   * Get the max value of a given key
   */
  max(key?: keyof T): number {
    return this.collection.max(key as any);
  }

  /**
   * Merge the collection with the given items
   */
  merge(items: T[]): Collection<T> {
    return new Collection(this.collection.merge(items).all());
  }

  /**
   * Get the min value of a given key
   */
  min(key?: keyof T): number {
    return this.collection.min(key as any);
  }

  /**
   * Get the items with the specified keys
   */
  only(keys: (keyof T)[]): Collection<T> {
    return new Collection(this.collection.only(keys as any).all());
  }

  /**
   * Get and remove the last item from the collection
   */
  pop(): T | undefined {
    return this.collection.pop();
  }

  /**
   * Push an item onto the beginning of the collection
   */
  prepend(value: T): this {
    this.collection.prepend(value);
    return this;
  }

  /**
   * Get and remove an item from the collection
   */
  pull(key: number): T | undefined {
    const result = this.collection.pull(key);
    return result === null ? undefined : result;
  }

  /**
   * Push an item onto the end of the collection
   */
  push(value: T): this {
    this.collection.push(value);
    return this;
  }

  /**
   * Put an item in the collection by key
   */
  put(key: number, value: T): this {
    this.collection.put(key, value);
    return this;
  }

  /**
   * Get one or a specified number of items randomly from the collection
   */
  random(count?: number): T | Collection<T> {
    if (count) {
      const result = this.collection.random(count) as CollectJsCollection<T>;
      return new Collection(result.all());
    }
    return this.collection.random() as T;
  }

  /**
   * Reduce the collection to a single value
   */
  reduce<U>(callback: (carry: U, item: T) => U, initial: U): U {
    return this.collection.reduce(callback as any, initial);
  }

  /**
   * Filter items by the given key value pair
   */
  reject(callback: (item: T, key: number) => boolean): Collection<T> {
    return new Collection(this.collection.reject(callback as any).all());
  }

  /**
   * Reverse items order
   */
  reverse(): Collection<T> {
    return new Collection(this.collection.reverse().all());
  }

  /**
   * Search the collection for a given value
   */
  search(value: T | ((item: T) => boolean)): number | false {
    const result = this.collection.search(value as any);
    return result === false ? false : result;
  }

  /**
   * Get and remove the first item from the collection
   */
  shift(): T | undefined {
    return this.collection.shift();
  }

  /**
   * Shuffle the items in the collection
   */
  shuffle(): Collection<T> {
    return new Collection(this.collection.shuffle().all());
  }

  /**
   * Slice the underlying collection array
   */
  slice(start: number, length?: number): Collection<T> {
    return new Collection(this.collection.slice(start, length).all());
  }

  /**
   * Sort through each item with a callback
   */
  sort(callback?: (a: T, b: T) => number): Collection<T> {
    return new Collection(this.collection.sort(callback as any).all());
  }

  /**
   * Sort the collection by the given key
   */
  sortBy(key: keyof T | ((item: T) => any)): Collection<T> {
    return new Collection(this.collection.sortBy(key as any).all());
  }

  /**
   * Sort the collection in descending order by the given key
   */
  sortByDesc(key: keyof T | ((item: T) => any)): Collection<T> {
    return new Collection(this.collection.sortByDesc(key as any).all());
  }

  /**
   * Splice a portion of the underlying collection array
   */
  splice(start: number, length?: number, ...items: T[]): Collection<T> {
    const actualLength = length ?? 0;
    const itemsArray = items as any;
    return new Collection(this.collection.splice(start, actualLength, ...itemsArray).all());
  }

  /**
   * Get the sum of the given values
   */
  sum(key?: keyof T | ((item: T) => number)): number {
    const result = this.collection.sum(key as any);
    return typeof result === "number" ? result : 0;
  }

  /**
   * Take the first or last {limit} items
   */
  take(limit: number): Collection<T> {
    return new Collection(this.collection.take(limit).all());
  }

  /**
   * Pass the collection to the given callback and return the result
   */
  pipe<U>(callback: (collection: Collection<T>) => U): U {
    return callback(this);
  }

  /**
   * Pass the collection to the given callback and then return it
   */
  tap(callback: (collection: Collection<T>) => void): this {
    callback(this);
    return this;
  }

  /**
   * Transform each item in the collection using a callback
   */
  transform(callback: (item: T, key: number) => T): this {
    this.collection = this.collection.map(callback as any);
    return this;
  }

  /**
   * Return only unique items from the collection array
   */
  unique(key?: keyof T): Collection<T> {
    return new Collection(this.collection.unique(key as any).all());
  }

  /**
   * Reset the keys on the underlying array
   */
  values(): Collection<T> {
    return new Collection(this.collection.values().all() as T[]);
  }

  /**
   * Filter items by the given key value pair
   */
  where(key: keyof T, value: any): Collection<T>;
  where(key: keyof T, operator: string, value: any): Collection<T>;
  where(key: keyof T, operatorOrValue: any, value?: any): Collection<T> {
    if (value === undefined) {
      return new Collection(this.collection.where(key as any, operatorOrValue).all());
    }
    return new Collection(this.collection.where(key as any, operatorOrValue, value).all());
  }

  /**
   * Filter items by the given key value pair using loose comparison
   */
  whereIn(key: keyof T, values: any[]): Collection<T> {
    return new Collection(this.collection.whereIn(key as any, values).all());
  }

  /**
   * Filter items by the given key value pair using loose comparison
   */
  whereNotIn(key: keyof T, values: any[]): Collection<T> {
    return new Collection(this.collection.whereNotIn(key as any, values).all());
  }

  /**
   * Zip the collection together with one or more arrays
   */
  zip<U>(...arrays: U[][]): Collection<any[]> {
    const zipArgs = arrays as any;
    return new Collection((this.collection as any).zip(...zipArgs).all() as any[]);
  }

  /**
   * Convert the collection to a plain array
   */
  toArray(): T[] {
    return this.all();
  }

  /**
   * Convert the collection to JSON
   */
  toJson(): string {
    return JSON.stringify(this.all());
  }

  /**
   * Get the collection as a string
   */
  toString(): string {
    return this.toJson();
  }
}

/**
 * Helper function to create a new collection
 */
export function collect<T>(items: T[] = []): Collection<T> {
  return new Collection(items);
}
