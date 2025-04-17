import { Component } from '@angular/core';
import { CoursesPageComponent } from "../courses/courses-page/courses-page.component";
import { LogsComponent } from "./logs/logs.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CoursesPageComponent, LogsComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
