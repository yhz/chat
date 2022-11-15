export function getRandomIntegerInRange(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

export function deserializeEntity<T>(
  targetClass: Function & { prototype: T },
  props: object
): T {
  const entity = Object.create(targetClass.prototype);
  Object.assign(entity, props);

  return entity;
}
