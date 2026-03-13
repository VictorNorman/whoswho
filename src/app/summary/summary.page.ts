import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonItem, IonButton, IonToggle, ToggleCustomEvent } from '@ionic/angular/standalone';
import { GameDataService } from '../services/game-data.service';
import { RouterLink } from '@angular/router';
import { Share } from '@capacitor/share';
import { MessagingService } from '../services/messaging.service';


@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
  standalone: true,
  imports: [IonToggle, IonButton, IonItem, IonImg, IonContent,
    CommonModule, FormsModule, RouterLink]
})
export class SummaryPage implements OnInit {

  public dataSvc = inject(GameDataService);
  public mesgSvc = inject(MessagingService);

  public streak = -1;

  public userHasChosenNotifsPreviously: boolean = true;
  protected toggleReceiveNotifsOn = signal<boolean>(true);

  async ngOnInit() {
    this.dataSvc.incrementStreak();
    this.streak = this.dataSvc.getStreak();
    this.userHasChosenNotifsPreviously = await this.mesgSvc.userHasStoredReceiveNotifsPref();

    if (!this.userHasChosenNotifsPreviously) {
      // if user has not chosen previously, assume they want notifs... :-)
      this.toggleReceiveNotifsOn.set(true);
      this.mesgSvc.registerToReceiveNotifs();
    } else {
      const userPref = await this.mesgSvc.getReceiveNotifsPref();
      if (userPref) {
        this.mesgSvc.registerToReceiveNotifs();
      }
      this.toggleReceiveNotifsOn.set(userPref);
    }
  }

  public restart(): void {
    this.dataSvc.resetQuiz$.next();
  }

  public genNstars(n: number) {
    return `⭐ x ${n}`;
  }

  public async shareResults() {
    // https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const todayStr = `${mm}/${dd}/${yyyy}`;

    // if the user cancels Share, that's OK. catch and do nothing.
    try {
      await Share.share({
        title: 'Share your score',
        // eslint-disable-next-line max-len
        text: `Image Bearers on ${todayStr}: ${this.genNstars(this.dataSvc.score$())} on ${this.dataSvc.getDifficulty(this.dataSvc.gameMode$())} mode, and have a daily streak of ${this.dataSvc.getStreak()}!`,
        dialogTitle: 'Share your score',
      });
    } catch (e) {
    }
  }

  saveMissedImageBearers() {
    this.dataSvc.saveMissedImageBearersToStorage();
  }

  toggleDailQuiz(ev: Event) {
    const tev = ev as ToggleCustomEvent;
    console.log(tev.detail.checked);
    if (tev.detail.checked) {
      this.mesgSvc.registerToReceiveNotifs();
    } else {
      // user unselected the option, so remove the token from cloud firestore.
      this.mesgSvc.unregisterFromReceiveNotifs();
    }
  }

  // '🟨';
  // '🟩';
  // '⬛'
}
