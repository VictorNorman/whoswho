import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFirestore } from '@angular/fire/compat/firestore/';

interface TokenDbType {
  lastTimeAppUsed: any;     // timestamp
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  private token: string | null = null;

  constructor(
    private db: AngularFirestore,
    private afMessaging: AngularFireMessaging) { }

  requestPermission() {
    return this.afMessaging.requestToken.subscribe(
      token => {
        if (token) {
          // store in database under uid of the user.
          // console.log('Token is ', token);
          this.token = token;
          this.db.collection<TokenDbType>('tokens').doc(token).set({
            lastTimeAppUsed: new Date(),
          });
        }
      },
      error => {
        console.error('Could not get token for push notifications!!!: ', error);
      }
    );
  }

  getMessages() {
    return this.afMessaging.messages;
  }

  getToken() {
    return this.token || '<no token>';
  }
}
