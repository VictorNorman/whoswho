import { inject, Injectable } from '@angular/core';
import { getToken, Messaging } from '@angular/fire/messaging';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

interface TokenDbType {
  lastTimeAppUsed: any;     // timestamp
}


// All from https://github.com/angular/angularfire/blob/main/docs/messaging.md

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private messaging = inject(Messaging);
  private fs = inject(Firestore);

  private token: string | null = null;


  constructor() {
    this.registerToReceiveNotifs();
  }

  async registerToReceiveNotifs() {
    console.log("registerToReceiveNotifs!!! ");
    return new Promise<string>(async (resolve, reject) => {
      try {
        // Asks for permission and if granted, returns the token.
        const token = await getToken(this.messaging);
        this.token = token;
        console.log('😀😀😀😀😀😀 😀 my fcm token', token);
        const docRef = doc(this.fs, 'tokens', token);
        setDoc(docRef, {
          lastTimeAppUsed: new Date(),
        });
        resolve(token);
      } catch {
        reject("Could not get permission to register to receive notifications.");
      }
    });
  }
}
// navigator.serviceWorker
//   .register("/assets/firebase-messaging-sw.js", {
//     type: "module",
//   })
//   .then((serviceWorkerRegistration) => {
//     console.log("Hello from the service worker!");
//     getToken(this.messaging, {
//       vapidKey: `BPkyOFn07nh7JTTycAu-miHdUizCKoEmF5cCrdPZGLNCWZWvKDD6lPVbbrHRxC8pzXeKTCex9lNeAQ1U7InjAn0`,
//       serviceWorkerRegistration: serviceWorkerRegistration,
//     }).then((fcmToken) => {
//       console.log('my fcm token', fcmToken);
//       //
//       const docRef = doc(collection(this.fs, 'tokens'), fcmToken);
//       setDoc(docRef, {
//         lastTimeAppUsed: new Date(),
//       });
//     });
//   });
// this.message$ = new Observable((sub) => onMessage(this.messaging, (msg) =>
//   sub.next(msg))).pipe(
//     tap((msg) => {
//       console.log("My Firebase Cloud Message", msg);
//     })
//   );


// TODO: fix this name!
// requestPermission() {
//   return this.messaging.requestToken.subscribe(
//     token => {
//       if (token) {
//         // store in database under uid of the user.
//         // console.log('Token is ', token);
//         this.token = token;
//         this.db.collection<TokenDbType>('tokens').doc(token).set({
//           lastTimeAppUsed: new Date(),
//         });
//       }
//     },
//     error => {
//       console.error('Could not get token for push notifications!!!: ', error);
//     }
//   );
// }


//   getMessages() {
//     return this.afMessaging.messages;
//   }

//   getToken() {
//     return this.token || '<no token>';
//   }
// }
