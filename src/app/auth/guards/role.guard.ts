import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

export const RoleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles = route.data?.['allowedRoles'] || [];

  return store.select(selectCurrentUser).pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      if (allowedRoles.includes(user.role)) {
        return true;
      }

      router.navigate(['/']);
      return false;
    })
  );
};
