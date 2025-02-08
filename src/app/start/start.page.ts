import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonImg, IonList, IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GameDataService } from '../services/game-data.service';
import { Storage } from '@ionic/storage-angular';
import { MessagingService } from '../services/messaging.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [IonInput,
    IonButton,
    IonLabel,
    IonItem,
    IonList,
    IonImg,
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class StartPage {

  public disableSubmit = true;

  gameDataSvc = inject(GameDataService);
  router = inject(Router);
  toastCtrl = inject(ToastController);
  storage = inject(Storage);
  messaging = inject(MessagingService);

  formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    organization: [''],
    secret: [''],
  });

  constructor(
  ) {
  }

  async ngOnInit() {
    await this.storage.create();
    const organization = (await this.storage.get('organization')) || '';
    const secret = (await this.storage.get('secret')) || '';
    this.loginForm.setValue({ organization, secret });
  }

  public async onSubmit() {
    const organization = this.loginForm.get<string>('organization')?.value.trim();
    const secret = this.loginForm.get<string>('secret')?.value.trim();
    try {
      await this.gameDataSvc.checkOrgAndSecretAgainstDb(organization, secret);
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Wrong organization or secret',
        duration: 1000,
      });
      await toast.present();
      return;
    }

    // good organization and secret, so save the info for next time.
    this.saveUserInfo();
    this.router.navigateByUrl('choose-mode');
  }

  private saveUserInfo() {
    this.storage.set('organization', this.loginForm.get<string>('organization')!.value);
    this.storage.set('secret', this.loginForm.get<string>('secret')!.value);
  }

}
