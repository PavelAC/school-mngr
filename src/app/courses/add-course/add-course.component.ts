import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, filter } from 'rxjs/operators';
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
export class AddCourseComponent implements OnInit {
  courseForm: FormGroup;
  isAdmin$: Observable<boolean>;
  isSubmitting = false;
  error: string | null = null;
  currentUser$: Observable<User | null>;
  selectedTeacher: User | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ courses: CoursesState, auth: AuthState }>,
  ) {
    this.currentUser$ = this.store.select(fromAuth.selectCurrentUser);
    this.isAdmin$ = this.store.select(fromAuth.selectIsAdmin);

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
      teacherId: [null] 
    });
  }
  onTeacherSelected(user: User) {
    this.selectedTeacher = user;
    this.courseForm.patchValue({ teacherId: user.uid }); 
  }

  ngOnInit() {
    this.store.select(state => state.courses.error)
      .pipe(filter(error => !!error))
      .subscribe(error => {
        this.isSubmitting = false;
        this.error = error;
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
  
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.error = "User not found!";
        this.isSubmitting = false;
        return;
      }
  
      if (user.role !== 'admin' && user.role !== 'teacher') {
        this.error = "Permission denied: You do not have the required role to create a course.";
        this.isSubmitting = false;
        return;
      }

      const formValue = this.courseForm.value;
      const courseData: Omit<Course, 'id'> = {
        title: formValue.title,
        description: formValue.description,
        enrollmentCode: formValue.enrollmentCode || undefined,
        createdBy: user.uid,
        teacherId: formValue.teacherId || null, 
        studentIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.store.dispatch(CourseActions.createCourse({ 
        course: courseData, 
        user 
      }));
  
      this.isSubmitting = false;
    });
  }
}