// import { Component } from '@angular/core';

// @Component({
//   
// })
// export class AddCourseComponent {

// }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, filter } from 'rxjs/operators';

import * as CourseActions from '../store/courses.actions';
import * as fromAuth from '../../auth/store/auth.selectors';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import { AuthState } from '../../auth/store/auth.reducer';
import { CoursesState } from '../store/courses.reducer';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-add-course',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './add-course.component.html',
    styleUrl: './add-course.component.css'
})
export class AddCourseComponent implements OnInit {
  courseForm: FormGroup;
  isAdmin$: Observable<boolean>;
  isSubmitting = false;
  error: string | null = null;
  currentUser: Observable<User | null>;


  constructor(
    private fb: FormBuilder,
    private store: Store<CoursesState>,
    private authStore: Store<AuthState>
  ) {
    this.currentUser = this.authStore.select(fromAuth.selectCurrentUser);
    // Create form with validators
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
      enrollmentCode: ['']
    });

    // Check if current user is an admin
    this.isAdmin$ = this.store.select(fromAuth.selectIsAdmin);

    // Get current user
    this.store.select(fromAuth.selectCurrentUser)
      .pipe(take(1))
      .subscribe(user => {
        this.currentUser = this.store.select(fromAuth.selectCurrentUser);

      });
  }

  ngOnInit() {
    // Optional: Subscribe to course creation success/failure
    this.store.select(state => state.courses)
      .pipe(
        filter(error => !!error)
      )
      .subscribe(error => {
        this.isSubmitting = false;
      });
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      Object.keys(this.courseForm.controls).forEach(key => {
        this.courseForm.get(key)?.markAsTouched();
      });
      return;
    }
  
    if (this.isSubmitting) return;
  
    this.isSubmitting = true;
    this.error = null;
  
    // Fetch the current user before dispatching
    this.currentUser.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.error = "User not found!";
        this.isSubmitting = false;
        return;
      }
  
      const courseData: Omit<Course, 'id'> = {
        ...this.courseForm.value,
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        students: [],
        teachers: []
      };
  
      if (user.role !== 'admin' && user.role !== 'teacher') {
        this.error = "Permission denied: You do not have the required role to create a course.";
        this.isSubmitting = false;
        return;
      }
      
      this.store.dispatch(CourseActions.createCourse({ course: courseData, user }));

  
      this.courseForm.reset({
        title: '',
        description: '',
        enrollmentCode: ''
      });
  
      this.isSubmitting = false;
    });
  }
  
  
}
