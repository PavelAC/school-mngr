import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, of, from } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { AuthActions } from './auth.actions';
import { UserRole } from '../../models/user-roles.enum';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Check Auth State effect
  checkAuthState$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.checkAuthState),
      switchMap(() => 
        this.authService.currentUser$.pipe(
          map(user => AuthActions.authStateChanged({ user }))
        )
      )
    )
  );

  // Login effect
  login$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) => 
        this.authService.login(email, password).pipe(
          switchMap(firebaseUser => 
            this.authService.currentUser$.pipe(
              map(user => {
                if (!user) throw new Error('User data not found');
                return AuthActions.loginSuccess({ user });
              })
            )
          ),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  // Register effect
  register$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, password, role, displayName }) => 
        this.authService.register(email, password, role as UserRole, displayName).pipe(
          map(user => AuthActions.registerSuccess({ user })),
          catchError(error => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  // Logout effect
  logout$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() => 
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => of(AuthActions.logoutFailure({ error: error.message })))
        )
      )
    )
  );

  // Update profile effect
  updateProfile$ = createEffect(() => 
    this.actions$.pipe(
      ofType(AuthActions.updateProfile),
      switchMap(({ uid, data }) => 
        this.authService.updateProfile(uid, data).pipe(
          switchMap(() => this.authService.currentUser$),
          map(user => {
            if (!user) throw new Error('User data not found');
            return AuthActions.updateProfileSuccess({ user });
          }),
          catchError(error => of(AuthActions.updateProfileFailure({ error: error.message })))
        )
      )
    )
  );

  // Navigation effects
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(({ user }) => {
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/courses']);
            break;
          case 'teacher':
            this.router.navigate(['/courses']);
            break;
          case 'student':
            this.router.navigate(['/courses']);
            break;
          default:
            this.router.navigate(['/']);
        }
      })
    ),
    { dispatch: false }
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => this.router.navigate(['/login']))
    ),
    { dispatch: false }
  );
}