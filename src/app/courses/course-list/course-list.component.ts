import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import * as CourseActions from '../store/courses.actions';
import * as CourseSelectors from '../store/courses.selectors';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import { CourseComponent } from "../course/course.component";
import { CommonModule } from '@angular/common';
import { AddCourseComponent } from "../add-course/add-course.component";
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CourseComponent, CommonModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent implements OnInit {
  courses$: Observable<Course[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  selectedCourse$: Observable<Course | undefined>;
  currentUser$: Observable<User | null>;

  constructor(
    private store: Store,
    private auth: AuthService
  ) {
    this.courses$ = this.store.select(CourseSelectors.selectAllCourses);
    this.loading$ = this.store.select(CourseSelectors.selectCoursesLoading);
    this.error$ = this.store.select(CourseSelectors.selectCoursesError);
    this.selectedCourse$ = this.store.select(CourseSelectors.selectSelectedCourse);
    
    // Use the AuthService's currentUser$ observable
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit() {
    // Dispatch action to load courses when component initializes
    this.store.dispatch(CourseActions.loadCourses());
  }

  selectCourse(courseId: string) {
    this.store.dispatch(CourseActions.selectCourse({ courseId }));
  }

  enrollInCourse(courseId: string, event: Event) {
    // Prevent event from bubbling to selectCourse
    event.stopPropagation();

    // Get current user from observable
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.store.dispatch(CourseActions.enrollInCourse({
          courseId,
          userId: user.uid
        }));
      }
    });
  }
}