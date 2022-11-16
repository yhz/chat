import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';
import User from '@shared/user.entity';
import { ApiFacade } from './api.facade';
import jwtDecode from 'jwt-decode';
import { JwtPayload } from '@shared/interfaces';
import { deserializeEntity } from '@shared/helpers';
import { BadTokenErrorMessage } from '@shared/constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public readonly currentUser$: ReplaySubject<User | null> = new ReplaySubject(1);
  public readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map(Boolean),
  );

  private SESSION_TOKEN_KEY = 'sessionToken';

  constructor(
    private apiFacade: ApiFacade,
    private router: Router
  ) {
    this.loginByToken().subscribe((user) => {
      this.currentUser$.next(user);
    });
  }

  public loginByToken(): Observable<User | null> {
    const token = localStorage.getItem(this.SESSION_TOKEN_KEY);

    if (token) {
      return this.apiFacade.loginByToken(token).pipe(
        tap(() => {
          const user = this.getUserFromToken(token);
          this.currentUser$.next(user);
        }),
        catchError((error) => {
          if (error.message === BadTokenErrorMessage) {
            this.clearToken();
            return of(null);
          }

          return throwError(() => error);
        })
      );
    }

    return of(null);
  }

  public login(username: string): Observable<string> {
    return this.apiFacade.login(username).pipe(
      tap(this.setToken.bind(this)),
    );
  }

  public logout(): Observable<boolean> {
    return this.apiFacade.logout().pipe(
      tap(() => this.clearToken()),
      tap(() => this.router.navigate(['/login'])),
    );
  }

  private setToken(token: string): void {
    const user = this.getUserFromToken(token);

    localStorage.setItem(this.SESSION_TOKEN_KEY, token);
    this.currentUser$.next(user);
  }

  private clearToken(): void {
    this.currentUser$.next(null);
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
  }

  private getUserFromToken(token: string): User | null {
    let user: User | null;

    try {
      const decodedToken: JwtPayload = jwtDecode(token);

      if (!decodedToken?.user) {
        user = null;
      }

      user = deserializeEntity(User, decodedToken.user);
    } catch {
      user = null;
    }

    return user;
  }

}