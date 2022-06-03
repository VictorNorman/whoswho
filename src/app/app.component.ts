import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private swUpdate: SwUpdate,
    private platform: Platform)
  {
    this.checkForUpdates();
    platform.ready().then(async () => {
    });
  }

  async checkForUpdates(): Promise<void> {

    if (await this.swUpdate.checkForUpdate()) {
      console.log('checkforUpdate returned true!');
      if (confirm('A new version is available. Load it?')) {
        try {
          await this.swUpdate.activateUpdate();
          confirm('New version activated!');
          window.location.reload();
        } catch {
          console.log('FAILED to ACTIVATE new version!');
        }
      }
    } else {
      console.log('no new version found');
    }


  }

}
