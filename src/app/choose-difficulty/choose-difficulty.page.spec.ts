import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseDifficultyPage } from './choose-difficulty.page';

describe('ChooseDifficultyPage', () => {
  let component: ChooseDifficultyPage;
  let fixture: ComponentFixture<ChooseDifficultyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseDifficultyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
