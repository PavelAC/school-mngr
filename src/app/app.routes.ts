import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login.component';
import { CoursesPageComponent } from './courses/courses-page/courses-page.component';
import { RegisterComponent } from './auth/components/register.component';
// import { CoursesComponent } from './courses/courses.component';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/login', 
        pathMatch: 'full' 
      },
      // { 
      //   path: 'login', 
      //   loadComponent: () => import('./auth/components/login.component').then(m => m.LoginComponent)
      // },
      // { 
      //   path: 'register', 
      //   loadComponent: () => import('./auth/components/register.component').then(m => m.RegisterComponent)
      // },
      // { path: 'courses', component: CoursesComponent },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      { path: 'courses', component: CoursesPageComponent },
];
