import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorialService } from '@services/tutorial.service';
import { MockTutorialService } from '@services/tutorial.service.spec';
import { SharedModule } from '../shared.module';

import { TutorialComponent } from './tutorial.component';

describe('TutorialComponent', () => {
  let component: TutorialComponent;
  let fixture: ComponentFixture<TutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [TutorialComponent],
      providers: [{ provide: TutorialService, useValue: MockTutorialService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
