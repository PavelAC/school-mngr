import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import * as CourseActions from '../../store/course/courses.actions';
import * as CourseSelectors from '../../store/course/courses.selectors';
import * as AuthSelectors from '../../store/auth/auth.selectors';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import { CourseComponent } from "../course/course.component";
import { selectAllCourses, selectSelectedCourse, selectSelectedCourseId } from '../../store/course/courses.selectors';
import { selectCourse } from '../../store/course/courses.actions';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, CourseComponent],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit{
  
  private store = inject(Store);
  private authSerive = inject(AuthService)

  courses$ = this.store.select(selectAllCourses);
  selectedCourse$ = this.store.select(selectSelectedCourse);
  selectedCourseId$ = this.store.select(selectSelectedCourseId);
  loading$ = this.store.select(CourseSelectors.selectCoursesLoading);

  ngOnInit(): void {
    this.store.dispatch(CourseActions.loadCourses());
  }
  selectCourse(courseId: string): void {
    this.store.dispatch(selectCourse({ courseId }));
  }
}