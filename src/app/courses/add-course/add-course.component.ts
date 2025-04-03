import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { take, filter, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import * as CourseActions from '../../store/course/courses.actions';
import * as fromAuth from '../../store/auth/auth.selectors';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import { AuthState } from '../../store/auth/auth.reducer';
import { CoursesState } from '../../store/course/courses.reducer';
import { UserListComponent } from "../../student-list/user-list.component";

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserListComponent],
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent implements OnInit, OnDestroy {
  courseForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  
  // Observables
  currentUser$: Observable<User | null> = this.store.select(fromAuth.selectCurrentUser);
  isAdmin$: Observable<boolean> = this.store.select(fromAuth.selectIsAdmin);
  loading$: Observable<boolean> = this.store.select(fromAuth.selectAuthLoading);
  
  selectedTeacher: User | null = null;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<{ courses: CoursesState, auth: AuthState }>,
  ) {
    this.courseForm = this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      enrollmentCode: [''],
      teacherId: [null, Validators.required] // Added required validator if teacher is mandatory
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(state => state.courses.error)
        .pipe(
          distinctUntilChanged(),
          filter(error => !!error)
        )
        .subscribe(error => {
          this.isSubmitting = false;
          this.error = error;
        })
    );
    this.store.select(state => state.auth).pipe(take(1)).subscribe(authState => {
      console.log('Complete Auth State:', authState);
    });
    this.currentUser$.pipe(take(1)).subscribe(user => {
      console.log('Current User:', user);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onTeacherSelected(user: User): void {
    this.selectedTeacher = user;
    this.courseForm.patchValue({ teacherId: user.uid });
    this.courseForm.get('teacherId')?.markAsTouched();
    console.log(this.selectedTeacher)
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.markAllAsTouched();
      return;
    }
  
    if (this.isSubmitting) return;
  
    this.isSubmitting = true;
    this.error = null;
  
    combineLatest([this.currentUser$, this.loading$])
      .pipe(take(1))
      .subscribe(([user, loading]) => {
        if (loading) return;

        if (!user) {
          this.handleError("User not found!");
          return;
        }
  
        if (user.role !== 'admin' && user.role !== 'teacher') {
          this.handleError("Permission denied: You do not have the required role to create a course.");
          return;
        }

        this.createCourse(user);
      });
  }

  private markAllAsTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }

  private handleError(message: string): void {
    this.error = message;
    this.isSubmitting = false;
  }

  private createCourse(user: User): void {
    const formValue = this.courseForm.value;
    const courseData: Omit<Course, 'id'> = {
      title: formValue.title,
      description: formValue.description,
      enrollmentCode: formValue.enrollmentCode || this.generateEnrollmentCode(),
      createdBy: user.uid,
      teacherId: formValue.teacherId,
      studentIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.store.dispatch(CourseActions.createCourse({ 
      course: courseData, 
      user 
    }));
  }

  private generateEnrollmentCode(): string {
    // Implement your enrollment code generation logic here
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}