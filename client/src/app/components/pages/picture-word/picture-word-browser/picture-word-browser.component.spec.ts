import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { APIService } from '@services/api.service';
import { MockAPIService } from '@services/api.service.spec';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';

import { PictureWordBrowserComponent } from './picture-word-browser.component';

describe('PictureWordBrowserComponent', () => {
  let component: PictureWordBrowserComponent;
  let fixture: ComponentFixture<PictureWordBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, StatusBarModule],
      declarations: [PictureWordBrowserComponent],
      providers: [
        { provide: APIService, useValue: MockAPIService },
        { provide: GameService, useValue: MockGameService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureWordBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
