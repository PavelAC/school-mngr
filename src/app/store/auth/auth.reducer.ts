import { createReducer, on } from '@ngrx/store';
import { AuthActions, loadUsers, loadUsersFailure, loadUsersSuccess } from './auth.actions';
import { User } from '../../models/user.model';

export interface AuthState {
  currentUser: User | null;  // Consistent property name
  allUsers: User[];
  loading: boolean;
  error: any;
}

export const initialState: AuthState = {
  currentUser: null,
  allUsers: [],
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  // Login actions
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({ 
    ...state, 
    loading: false, 
    currentUser: user
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Logout action
  on(AuthActions.logout, (state) => ({ ...state, loading: true })),


  // Registration actions
  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { user }) => ({ 
    ...state, 
    loading: false, 
    currentUser: user
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // User loading actions
  on(loadUsers, (state) => ({ ...state, loading: true, error: null })),
  on(loadUsersSuccess, (state, { users }) => {
    if (!users) {
      console.error('Received null users in reducer');
      return state;
    }
    console.log('Reducer received users:', users);
    return { 
      ...state, 
      loading: false, 
      allUsers: users 
    };
  }),
  on(loadUsersFailure, (state, { error }) => ({ ...state, loading: false, error }))
);