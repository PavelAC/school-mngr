import { Component } from '@angular/core';
import { AddCourseComponent } from "../add-course/add-course.component";
import { CourseListComponent } from "../course-list/course-list.component";

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [AddCourseComponent, CourseListComponent],
  templateUrl: './courses-page.component.html',
  styleUrl: './courses-page.component.css'
})
export class CoursesPageComponent {

}
