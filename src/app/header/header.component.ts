import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromAuth from '../store/auth/auth.selectors';
import * as AuthActions from '../store/auth/auth.actions';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule,RouterModule],
})
export class HeaderComponent {
  currentUser$: Observable<User | null>;

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(fromAuth.selectCurrentUser);
  }

  // logout(): void {
  //   this.store.dispatch(AuthActions.);
  // }
}
