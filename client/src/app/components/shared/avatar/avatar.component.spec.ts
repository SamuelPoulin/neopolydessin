import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APIService } from '@services/api.service';
import { MockAPIService } from '@services/api.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';

import { AvatarComponent } from './avatar.component';

fdescribe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvatarComponent],
      providers: [
        { provide: APIService, useValue: MockAPIService },
        { provide: UserService, useValue: MockUserService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
