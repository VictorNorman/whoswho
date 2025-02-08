import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideServiceWorker } from '@angular/service-worker';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(
      {
        projectId: "vtn2-whoswho",
        appId: "1:909733348055:web:bfc2b3eb8de22b647fa692",
        storageBucket: "vtn2-whoswho.appspot.com",
        apiKey: "AIzaSyCMZN9f0sB2FSXWfkT7PnJFntRUYaR-Mbc",
        authDomain: "vtn2-whoswho.firebaseapp.com",
        messagingSenderId: "909733348055",
        measurementId: "G-S41MY9LVY7"
      })),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideServiceWorker('combined-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
});

// Sentry.init({
//   dsn: 'https://3dfb47cf7d2049aabc6dbf46ea5711db@o1158351.ingest.sentry.io/6642050',
//   integrations: [
//     new BrowserTracing({
//       tracingOrigins: ['localhost', 'https://yourserver.io/api'],
//       routingInstrumentation: Sentry.routingInstrumentation,
//     }),
//   ],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
// });