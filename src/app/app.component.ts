import { Component } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private swUpdate: SwUpdate) {
    this.initializeApp();
  }

  async initializeApp(): Promise<void> {

    if (await this.swUpdate.checkForUpdate()) {
      console.log('checkforUpdate returned true!');
      if (confirm('A new version is available. Load it?')) {
        try {
          await this.swUpdate.activateUpdate();
          confirm('new version activated');
          window.location.reload();
        } catch {
          console.log('FAILED to ACTIVATE new version!');
        }
      }
    } else {
      console.log('no new version found');
    }
    // const updatesAvailable = this.swUpdate.versionUpdates.pipe(
    //  filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
    //   map(evt => ({
    //     type: 'UPDATE_AVAILABLE',
    //     current: evt.currentVersion,
    //     available: evt.latestVersion,
    //   })));
    // if (this.swUpdate.available) {
    //   this.swUpdate.available.subscribe(() => {
    //     if (confirm('A new version is available. Load it?')) {
    //       window.location.reload();
    //     }
    //   });
    // }
  }
}
