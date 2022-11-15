export type EntityMap<T> = Map<string, T>;

export interface ScrollPosition {
  target: HTMLElement | null;
  scrollHeight: number;
  scrollTop: number;
}
