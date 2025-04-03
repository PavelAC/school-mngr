import { Component } from '@angular/core';
import { CourseListComponent } from "../courses/course-list/course-list.component";

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CourseListComponent],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css'
})
export class TeacherComponent {

}
