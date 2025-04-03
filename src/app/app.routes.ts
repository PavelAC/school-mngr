import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login.component';
import { CoursesPageComponent } from './courses/courses-page/courses-page.component';
import { RegisterComponent } from './auth/components/register.component';
import { RoleGuard } from './auth/guards/role.guard';
import { AdminComponent } from './admin/admin.component';
import { TeacherComponent } from './teacher/teacher.component';
// import { CoursesComponent } from './courses/courses.component';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/login', 
        pathMatch: 'full' 
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
{
    path: 'courses',
    component: TeacherComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: ['admin', 'teacher', 'student'] }
},
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [RoleGuard],
  data: { allowedRoles: ['admin', 'teacher', 'student'] }
},
];
