import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';
import { Storage } from '@ionic/storage-angular';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {

  public title = 'Image Bearers';
  public organization: string;
  public secret: string;

  cloudMessage = '';

  constructor(
    private gameDataSvc: GameDataService,
    private router: Router,
    private toastCtrl: ToastController,
    private storage: Storage,
  ) {
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
