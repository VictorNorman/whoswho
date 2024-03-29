import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../services/game-data.service';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {

  public streak = -1;

  constructor(
    public dataSvc: GameDataService,
  ) { }

  ngOnInit() {
    this.dataSvc.incrementStreak();
    this.streak = this.dataSvc.getStreak();
  }

  public redoQuiz(): void {
    this.dataSvc.resetCurrentPerson();
    this.dataSvc.resetScore();
  }

  public restart(): void {
    this.dataSvc.resetCurrentPerson();
    this.dataSvc.resetScore();
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
        text: `Image Bearers on ${todayStr}: ${this.genNstars(this.dataSvc.getScore())} on ${this.dataSvc.getDifficulty(this.dataSvc.getGameMode())} mode, and have a daily streak of ${this.dataSvc.getStreak()}!`,
        // eslint-disable-next-line max-len
        // text: `Image Bearers on ${todayStr}: ${this.genNstars(this.dataSvc.getScore())} on ${this.dataSvc.getDifficulty(this.dataSvc.getGameMode())} mode!`,
        dialogTitle: 'Share your score',
      });
    } catch (e) {
    }
  }

  // '🟨';
  // '🟩';
  // '⬛'
}
