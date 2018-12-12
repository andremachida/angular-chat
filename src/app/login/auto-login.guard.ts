import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AutoLoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    ): Observable<boolean> {
      return this.authService.isAuthenticated
        .pipe(
          tap(is => {
            if (is) {
              this.router.navigate(['/dashboard']);
            }
          }),
          map(is => !is)
        );
  }
}
