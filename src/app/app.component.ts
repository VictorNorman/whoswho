import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private swUpdate = inject(SwUpdate);


  constructor() {
    this.checkForUpdates();
  }

  async checkForUpdates(): Promise<void> {
    if (await this.swUpdate.checkForUpdate()) {
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
