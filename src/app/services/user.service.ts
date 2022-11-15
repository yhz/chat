import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import User from '@shared/user.entity';
import EntityCollection from '@shared/entityCollection';
import { ApiFacade } from '@client/services/api.facade';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly users: EntityCollection<User> = new EntityCollection();
  public readonly users$: Observable<User[]> = this.users.onChanges$.pipe(
    map((userMap) => Array.from(userMap.values()))
  );

  constructor(
    private apiFacade: ApiFacade,
  ) {
    this.listenUserLoggedInAlert().subscribe();
    this.listenUserLoggedOutAlert().subscribe();
  }

  public fetchAllUsers(): Observable<User[]> {
    return this.apiFacade.getUserList().pipe(
      tap((users) => this.users.overwriteAll(users)),
    );
  }

  private listenUserLoggedInAlert(): Observable<User> {
    return this.apiFacade.loggedIn$.pipe(
      tap((user) => this.users.set(user)),
    );
  }

  private listenUserLoggedOutAlert(): Observable<User> {
    return this.apiFacade.loggedOut$.pipe(
      tap((user) => this.users.delete(user)),
    );
  }

}
