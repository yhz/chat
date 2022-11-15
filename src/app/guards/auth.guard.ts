import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Path } from '@client/app-routing.module';
import { AuthService } from '@client/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const path = route.routeConfig?.path || '';
    const isLoginPage = path === Path.login;

    return this.authService
      .isAuthenticated$
      .pipe(
        map((isAuth) => {
          const result = (!isLoginPage && isAuth) || (isLoginPage && !isAuth);

          if (!result) {
            let navigatePath = isLoginPage ? Path.root : Path.login;
            this.router.navigate([navigatePath]);
          }

          return result;
        })
      );
  }

}
