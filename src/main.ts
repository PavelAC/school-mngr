import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideState, provideStore } from '@ngrx/store';
import { coursesReducer } from './app/store/course/courses.reducer';
import { authReducer } from './app/store/auth/auth.reducer';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
