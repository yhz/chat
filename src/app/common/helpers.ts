export function trackByUuid<T extends { uuid: string }>(index: number, entity: T) {
  return entity.uuid;
}

export function scrollTo(stopY: number, scrolledElement: HTMLElement, duration = 600) {
  const startY = scrolledElement.scrollTop;
  const difference = stopY - startY;
  const startTime = performance.now();

  const step = () => {
    const progress = (performance.now() - startTime) / duration;
    const amount = easeOutCubic(progress);
    scrolledElement.scrollTo({ top: startY + amount * difference });
    if (progress < 0.99) {
      window.requestAnimationFrame(step);
    }
  };

  step();
}

export function easeOutCubic(t: number) {
  return --t * t * t + 1;
};
