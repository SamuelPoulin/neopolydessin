import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeGamemodeComponent } from './home-gamemode.component';

describe('HomeGamemodeComponent', () => {
  let component: HomeGamemodeComponent;
  let fixture: ComponentFixture<HomeGamemodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeGamemodeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeGamemodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
