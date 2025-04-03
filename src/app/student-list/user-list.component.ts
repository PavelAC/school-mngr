import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthActions, loadUsers, addGrade } from '../store/auth/auth.actions';
import { selectAllUsers, selectAuthLoading, selectAuthError, selectCurrentUser } from '../store/auth/auth.selectors';
import { selectCourseGrades } from '../store/grades/grades.selectors'
import { Grade } from '../models/grade.model';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../store/auth/auth.reducer';
import * as fromAuth from '../store/auth/auth.selectors';
import { loadGrades } from '../store/grades/grades.actions';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() courseId?: string;
  @Input() roleFilter?: 'student' | 'teacher';
  @Input() users: User[] = [];
  @Output() userSelected = new EventEmitter<User>();
  currentUser$!: Observable<User | null>;
  users$: Observable<User[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  grades$: Observable<Grade[]>;
  filteredUsers: User[] = [];
  studentGrades: {[studentId: string]: {grades: number[], average: number}} = {};
  newGrade: {[studentId: string]: number} = {};
  private subs = new Subscription();
  private useInputUsers = false;
   isTeacher$: Observable<boolean> = this.store.select(fromAuth.selectIsTeacher);

  constructor(private store: Store<{ auth: AuthState}>) {
    this.users$ = this.store.select(selectAllUsers);
  this.loading$ = this.store.select(selectAuthLoading);
  this.error$ = this.store.select(selectAuthError);
  this.grades$ = this.store.select(selectCourseGrades(this.courseId || ''));
  this.currentUser$ = this.store.select(selectCurrentUser); 

  this.isTeacher$ = this.store.select(fromAuth.selectIsTeacher);
  }

  ngOnInit(): void {

    if (!this.users || this.users.length === 0) {
      this.loadUsers();
      this.useInputUsers = false;
    } else {
      this.useInputUsers = true;
    }
    if (this.courseId) {
      this.store.dispatch(loadGrades({ courseId: this.courseId }));
    }
    
    this.setupSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && changes['users'].currentValue) {
      this.useInputUsers = true;
      this.updateFilteredUsersFromInput();
    }
    
    if (changes['courseId'] && changes['courseId'].currentValue) {
      this.grades$ = this.store.select(selectCourseGrades(this.courseId!));
      this.setupSubscriptions();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private setupSubscriptions(): void {
    this.subs.add(
      combineLatest([this.users$, this.grades$]).subscribe(([users, grades]) => {
        if (!this.useInputUsers) {
          this.updateFilteredUsers(users);
        }
        this.mapGradesToStudents(grades);
      })
    );
  }

  private updateFilteredUsersFromInput(): void {
    // Filter the input users based on role
    this.filteredUsers = this.roleFilter 
      ? this.users.filter(user => user.role === this.roleFilter)
      : this.users;
  }

  private updateFilteredUsers(users: User[]): void {
    // Filter store users based on role
    this.filteredUsers = this.roleFilter 
      ? users.filter(user => user.role === this.roleFilter)
      : users;
  }

  private mapGradesToStudents(grades: Grade[]): void {
    this.studentGrades = {};
    grades.forEach(grade => {
      this.studentGrades[grade.studentId] = {
        grades: grade.grades,
        average: this.calculateAverage(grade.grades)
      };
    });
  }

  loadUsers(): void {
    this.store.dispatch(loadUsers());
  }

  addGrade(studentId: string): void {
    if (!this.courseId || !this.newGrade[studentId] || this.newGrade[studentId] < 1 || this.newGrade[studentId] > 10) {
      return;
    }
    
    this.store.dispatch(addGrade({
      courseId: this.courseId,
      studentId,
      grade: this.newGrade[studentId]
    }));
    
    this.newGrade[studentId] = 0;
  }

  calculateAverage(grades: number[]): number {
    if (!grades.length) return 0;
    const sum = grades.reduce((a, b) => a + b, 0);
    return parseFloat((sum / grades.length).toFixed(2));
  }

  selectUser(user: User): void {
    this.userSelected.emit(user);
  }
}