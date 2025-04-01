import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(allowedRoles: string[]): CanActivateFn {
    return (): Observable<boolean> => {
      return this.store.select(selectCurrentUser).pipe(
        take(1),
        map(user => {
          if (!user) {
            this.router.navigate(['/login']);
            return false;
          }
          

          if (allowedRoles.includes(user.role)) {
            return true;
          }
          
          switch (user.role) {
            // case 'admin':
            //   this.router.navigate(['/admin']);
            //   break;
            // case 'teacher':
            //   this.router.navigate(['/teacher']);
            //   break;
            // case 'student':
            //   this.router.navigate(['/student']);
            //   break;
            default:
              this.router.navigate(['/']);
          }
          
          return false;
        })
      );
    };
  }
}