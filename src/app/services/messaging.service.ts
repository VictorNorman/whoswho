import { inject, Injectable, signal } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
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
    this.initRegisteredForNotifs();
  }

  private async initRegisteredForNotifs(): Promise<void> {
    await this.storageReady;
    const stored = await this.storage.get('registeredForNotifs');
    this.registeredForNotifs.set(!!stored);
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
}

