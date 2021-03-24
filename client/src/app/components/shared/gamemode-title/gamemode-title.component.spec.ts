import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamemodeTitleComponent } from './gamemode-title.component';

describe('GamemodeTitleComponent', () => {
  let component: GamemodeTitleComponent;
  let fixture: ComponentFixture<GamemodeTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamemodeTitleComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamemodeTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
