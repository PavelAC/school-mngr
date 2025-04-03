import { Component } from '@angular/core';
import { CoursesPageComponent } from "../courses/courses-page/courses-page.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CoursesPageComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
