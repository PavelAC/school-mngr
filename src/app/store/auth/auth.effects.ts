import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, of, from } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { AuthActions, loadUsers, loadUsersFailure, loadUsersSuccess } from './auth.actions';
import { UserRole } from '../../models/user-roles.enum';
import { User } from '../../models/user.model';

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
                console.log(`curent user: ${user.displayName}, ${user.role}`);
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
  
  logoutRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
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
            this.router.navigate(['/admin']);
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

  
  loadUsers$ = createEffect(() => 
    this.actions$.pipe(
      ofType(loadUsers),
      tap(() => console.log('[AuthEffects] loadUsers action received')),
      switchMap(() => 
        this.authService.getAllUsers().pipe(
          tap(users => console.log('[AuthEffects] Users loaded:', users)),
          map((users: User[]) => {
            if (!users) {
              throw new Error('No users returned from service');
            }
            return loadUsersSuccess({ users });
          }),
          catchError(error => {
            console.error('[AuthEffects] Error loading users:', error);
            return of(loadUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );
  
}