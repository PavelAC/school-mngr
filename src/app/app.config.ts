import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { coursesReducer } from './store/course/courses.reducer';
import { CourseEffects } from './store/course/courses.effects';

const firebaseConfig = {
  apiKey: "AIzaSyAN38IfYsPOOfxeDNJotMO7omnAarjbXCs",
  authDomain: "school-mngr-278f2.firebaseapp.com",
  projectId: "school-mngr-278f2",
  storageBucket: "school-mngr-278f2.firebasestorage.app",
  messagingSenderId: "216192449792",
  appId: "1:216192449792:web:812522555091dac4af07e5",
  measurementId: "G-RBN3SRKJ47"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // Firebase providers
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // NgRx providers
    provideStore(),
    provideState({ name: 'auth', reducer: authReducer }),
    provideState({ name: 'courses', reducer: coursesReducer }),
    provideEffects(AuthEffects),
    provideEffects(CourseEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode()
    }),
    
    provideAnimations()
  ]
};