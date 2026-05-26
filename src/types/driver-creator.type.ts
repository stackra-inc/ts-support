/**
 * Custom driver creator function.
 *
 * Receives the raw instance config and returns a driver instance.
 */
export type DriverCreator<T> = (config: Record<string, any>) => T;
