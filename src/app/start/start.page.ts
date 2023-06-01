import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GameDataService } from '../services/game-data.service';
import { Storage } from '@ionic/storage-angular';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MessagingService } from '../services/messaging.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {

  public organization = '';
  public secret = '';
  public disableSubmit = true;

  constructor(
    private gameDataSvc: GameDataService,
    private router: Router,
    private toastCtrl: ToastController,
    private storage: Storage,
    private msgSvc: MessagingService,
  ) {
    // get the token for push notifications.
    this.msgSvc.requestPermission();
  }

  async ngOnInit() {
    await this.storage.create();
    this.organization = (await this.storage.get('organization')) || '';
    this.secret = (await this.storage.get('secret')) || '';
  }

  public async onSubmit() {
    this.organization = this.organization.trim();
    this.secret = this.secret.trim();
    try {
      await this.gameDataSvc.checkOrgAndSecretAgainstDb(this.organization, this.secret);
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Wrong organization or secret',
        duration: 1000,
      });
      await toast.present();
      return;
    }
    await this.gameDataSvc.getPeopleFromDb();
    // good organization and secret, so save the info for next time.
    this.saveUserInfo();
    this.router.navigateByUrl('choose-mode');
  }

  private saveUserInfo() {
    this.storage.set('organization', this.organization);
    this.storage.set('secret', this.secret);
  }

}
