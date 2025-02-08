import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizModalPage } from './quiz-modal.page';

describe('QuizModalPage', () => {
  let component: QuizModalPage;
  let fixture: ComponentFixture<QuizModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
