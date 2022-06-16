import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GameDataService } from '../game-data.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {

  public title = 'Image Bearers';
  public organization: string;
  public secret: string;

  constructor(
    private gameDataSvc: GameDataService,
    private router: Router,
    private toastCtrl: ToastController,
    private storage: Storage,
  )
  {  }

  async ngOnInit() {
    await this.storage.create();
    this.organization = (await this.storage.get('organization')) || '';
    this.secret = (await this.storage.get('secret')) || '';
    this.gameDataSvc.orgLoadedSubj.subscribe(async (val: string) => {
      if (val) {
        if (val === 'org loaded') {
          // good organization and secret, so save the info for next time.
          this.saveUserInfo();
          this.router.navigateByUrl('choose-mode');
        } else if (val === 'bad org or secret') {
          const toast = await this.toastCtrl.create({
            message: 'Wrong organization or secret',
            duration: 1000,
          });
          toast.present();
        }
      }
    });
  }

  public onSubmit(): void {
    this.organization = this.organization.trim();
    this.secret = this.secret.trim();
    // this will start the data service looking for the given org/secret.
    // when it completes its query, the subscription to the orgLoadSubj will fire, see above.
    this.gameDataSvc.checkOrgAndSecretAgainstDb(this.organization, this.secret);
  }

  private saveUserInfo() {
    this.storage.set('organization', this.organization);
    this.storage.set('secret', this.secret);
  }

}
