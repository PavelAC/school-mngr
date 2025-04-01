import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../../student-list/user-list.component';

import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import * as CourseActions from '../../store/course/courses.actions';
import * as fromAuth from '../../store/auth/auth.selectors';
import * as fromCourse from '../../store/course/courses.selectors';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  @Input() course: Course | null = null;
  
  currentUser$: Observable<User | null>; 
  showTeacherAssignment = false; 
  
  get courseId(): string | null {
    return this.course?.id || null;
  }

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(fromAuth.selectCurrentUser);
  }
  
  ngOnInit(): void {
  }

  assignTeacher(teacher: User): void {
    const courseId = this.getCourseId();
    if (!teacher?.uid || !courseId) return;
    
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser?.role === 'admin') {
        this.store.dispatch(CourseActions.assignTeacherToCourse({
          courseId: courseId as string,
          teacherId: teacher.uid,
          adminId: currentUser.uid
        }));
        this.showTeacherAssignment = false;
      }
    });
  }

  enrollStudent(studentId: string): void {
    if (!studentId || !this.courseId) return;
    
    this.store.dispatch(CourseActions.enrollInCourse({
      courseId: this.courseId,
      userId: studentId
    }));
  }

  removeTeacher(): void {
    const courseId = this.getCourseId();
    if (!courseId) return;
    
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser?.uid) {
        this.store.dispatch(CourseActions.removeTeacherFromCourse({
          courseId: courseId as string,
          adminId: currentUser.uid
        }));
      }
    });
  }

  editCourse(): void {
    if (this.courseId) {
      this.store.dispatch(CourseActions.editCourse({ courseId: this.courseId }));
      // Navigate to edit page if needed
    }
  }

  saveCourseChanges(changes: Partial<Course>): void {
    if (this.courseId) {
      this.store.dispatch(CourseActions.updateCourse({
        courseId: this.courseId,
        changes
      }));
    }
  }

  toggleTeacherAssignment(): void {
    this.showTeacherAssignment = !this.showTeacherAssignment;
  }
  private getCourseId(): string | null {
    return this.course?.id || null;
  }
}