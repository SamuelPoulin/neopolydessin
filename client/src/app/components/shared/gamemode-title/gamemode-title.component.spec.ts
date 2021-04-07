import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared.module';

import { GamemodeTitleComponent } from './gamemode-title.component';

fdescribe('GamemodeTitleComponent', () => {
  let component: GamemodeTitleComponent;
  let fixture: ComponentFixture<GamemodeTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
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
