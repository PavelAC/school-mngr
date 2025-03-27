// import { Component } from '@angular/core';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Course } from '../../models/course';
import * as CourseActions from '../store/courses.actions';
import * as fromAuth from '../../auth/store/auth.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent {
  @Input() course: Course | null = null;
  
  currentUser$: Observable<any>; // Replace with your user type

  constructor(
    private store: Store,
    private authStore: Store
  ) {
    this.currentUser$ = this.authStore.select(fromAuth.selectCurrentUser)
  }

  ngOnChanges(changes: SimpleChanges) {
    // Optional: You could add some logic here if needed when course changes
    if (changes['course']) {
      // Example: Log when course details change
      console.log('Course details updated:', this.course);
    }
  }

  editCourse() {
    // Implement course editing logic
    // This could open a modal or navigate to an edit page
    if (this.course) {
      // Example dispatch
      // this.store.dispatch(CourseActions.editCourse({ courseId: this.course.id }));
    }
  }
}
