import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: 'start',
    loadComponent: () => import('./start/start.page').then(m => m.StartPage)
  },
  {
    path: 'choose-difficulty',
    loadComponent: () => import('./choose-difficulty/choose-difficulty.page').then(m => m.ChooseDifficultyPage)
  },
  {
    path: 'choose-mode',
    loadComponent: () => import('./choose-mode/choose-mode.page').then(m => m.ChooseModePage)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz/quiz.page').then(m => m.QuizPage)
  },
  {
    path: 'quiz-modal',
    loadComponent: () => import('./quiz-modal/quiz-modal.page').then(m => m.QuizModalPage)
  },
  {
    path: 'summary',
    loadComponent: () => import('./summary/summary.page').then(m => m.SummaryPage)
  },
];
