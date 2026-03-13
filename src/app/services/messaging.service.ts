import { inject, Injectable, signal } from '@angular/core';
import { deleteDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Storage } from '@ionic/storage-angular';

interface TokenDbType {
  lastTimeAppUsed: any;     // timestamp
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private fs = inject(Firestore);
  private storage = inject(Storage);
  private storageReady = this.storage.create();

  private token: string | null = null;

  // Signal indicating whether the device is registered for notifications.
  public registeredForNotifs = signal<boolean>(false);

  constructor() {
  }

  // private async initRegisteredForNotifs(): Promise<void> {
  //   await this.storageReady;
  //   const stored = await this.storage.get('registeredForNotifs');
  //   this.registeredForNotifs.set(!!stored);
  // }

  // check if the user has recorded a preference
  public async userHasStoredReceiveNotifsPref(): Promise<boolean> {
    return await this.storage.get('registeredForNotifs') !== null;
  }

  // assume the user has a preference: get and return it.
  public async getReceiveNotifsPref(): Promise<boolean> {
    return await this.storage.get('registeredForNotifs') === 'true';
  }

  async registerToReceiveNotifs() {
    console.log("registerToReceiveNotifs!!! ");
    return new Promise<string>(async (resolve, reject) => {
      const perm = await FirebaseMessaging.requestPermissions();
      if (perm.receive !== 'granted') {
        reject(`Request to receive notifications denied: ${perm.receive}`);
        return;
      }
      try {
        // Asks for permission and if granted, returns the token.
        const token = await FirebaseMessaging.getToken({
          vapidKey: 'BCEj_LDyESgQOS8Xr000AclwD-c9tSgAUfaBFV3sPpAZN5RdxgiDzNMEdKKR2BjaYnyNevqRcEDNz95B-YN1ook'
        });
        this.token = token.token;
        console.log('😀😀😀😀😀😀 my fcm token', this.token);
        const docRef = doc(this.fs, 'tokens', this.token);
        setDoc(docRef, {
          lastTimeAppUsed: new Date(),
        });
        await this.storageReady;
        this.storage.set('registeredForNotifs', 'true');
        this.registeredForNotifs.set(true);
        resolve(this.token);
      } catch (err) {
        reject(`Could not get permission to register to receive notifications: ${err}`);
      }
    });
  }
  unregisterFromReceiveNotifs() {
    return new Promise<string>(async (resolve, reject) => {
      const perm = await FirebaseMessaging.requestPermissions();
      if (perm.receive !== 'granted') {
        reject(`Request to receive notifications denied: ${perm.receive}`);
        return;
      }
      try {
        // Asks for permission and if granted, returns the token.
        const token = await FirebaseMessaging.getToken({
          vapidKey: 'BCEj_LDyESgQOS8Xr000AclwD-c9tSgAUfaBFV3sPpAZN5RdxgiDzNMEdKKR2BjaYnyNevqRcEDNz95B-YN1ook'
        });
        this.token = token.token;
        console.log('😀😀😀😀😀😀 my fcm token', this.token);
        const docRef = doc(this.fs, 'tokens', this.token);
        deleteDoc(docRef);
        this.storage.set('registeredForNotifs', 'false');
        this.registeredForNotifs.set(false);
        resolve(this.token);
      } catch (err) {
        reject(`Could not get permission to unregister to receive notifications: ${err}`);
      }
    });
  }
}

