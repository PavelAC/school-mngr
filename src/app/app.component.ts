import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseListComponent } from "./courses/course-list/course-list.component";
import { HeaderComponent } from './header/header.component';
import { FirebaseActionLoggerEffects } from './store/firebase-action-logger';
import { loadeingSpinnerComponent } from "../../public/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, loadeingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy{
  // title = 'school-mngr';
  constructor(private logger: FirebaseActionLoggerEffects){}
  ngOnDestroy(): void {
      this.logger.flushLogs();
  }
}
