import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseModePage } from './choose-mode.page';

describe('ChooseModePage', () => {
  let component: ChooseModePage;
  let fixture: ComponentFixture<ChooseModePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseModePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
