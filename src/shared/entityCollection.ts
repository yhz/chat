import { Observable, ReplaySubject, Subject } from 'rxjs';
import { EntityMap } from '@client/common/interfaces';

export default class EntityCollection<T extends { uuid: string }> extends Map {

  private mapChange$: Subject<EntityMap<T>> = new ReplaySubject(1);
  public onChanges$: Observable<EntityMap<T>> = this.mapChange$.asObservable();

  constructor(
    private maxSize: number = 0,
  ) {
    super();
  }

  public overwriteAll(multipleEntities: T[]): this {
    super.clear();

    multipleEntities.forEach((entity) => {
      const uuid = entity.uuid;
      super.set(uuid, entity);
    });

    this.mapChange$.next(new Map(this));

    return this;
  }

  public setMultiple(multipleEntities: T[]): this {
    multipleEntities.forEach((entity) => {
      const uuid = entity.uuid;
      super.set(uuid, entity);
      this.checkLimitAndRemoveOlderEntity();
    });

    this.mapChange$.next(new Map(this));

    return this;
  }

  public override set(entity: T): this {
    const uuid = entity.uuid;
    super.set(uuid, entity);
    this.checkLimitAndRemoveOlderEntity();
    this.mapChange$.next(new Map(this));

    return this;
  }

  public override delete(entity: T): boolean {
    const uuid = entity.uuid;
    const deleteResult = super.delete(uuid);

    if (deleteResult) {
      this.mapChange$.next(new Map(this));
    }

    return deleteResult;
  }

  public override clear(): void {
    super.clear();
    this.mapChange$.next(new Map(this));
  }

  private checkLimitAndRemoveOlderEntity(): void {
    if (this.maxSize > 0 && this.maxSize === this.size) {
      const olderEntity: T = this.values().next()?.value;
      const uuid = olderEntity.uuid;
      super.delete(uuid);
    }
  }

}
