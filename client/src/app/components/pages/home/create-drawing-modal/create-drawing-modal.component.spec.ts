import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Color } from 'src/app/utils/color/color';
import { SharedModule } from '../../../shared/shared.module';

import createSpyObj = jasmine.createSpyObj;
import createSpy = jasmine.createSpy;
import { LocalSaveService } from '@services/localsave.service';
import { CreateDrawingModalComponent } from './create-drawing-modal.component';

describe('CreateDrawingModalComponent', () => {
  const dialogRefCloseSpy = createSpy('close');
  const routerSpy = createSpyObj('Router', {
    navigate: new Promise<boolean>(() => {
      return;
    }),
  });
  let component: CreateDrawingModalComponent;
  let fixture: ComponentFixture<CreateDrawingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [CreateDrawingModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: dialogRefCloseSpy } },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDrawingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onCreateClick when create button clicked', () => {
    const onCreateClickSpy = spyOn(component, 'onCreateClick');
    fixture.debugElement.nativeElement.querySelector('#btn-create').click();
    expect(onCreateClickSpy).toHaveBeenCalled();
  });

  it('should route correctly when calling onCreateClick', async(() => {
    routerSpy.navigate.and.returnValue(Promise.resolve());
    component.width = '2';
    component.height = '3';
    component.colorPicker.color = Color.RED;
    component.onCreateClick();

    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        'edit',
        {
          width: '2',
          height: '3',
          color: 'ff0000',
          id: LocalSaveService.NEW_DRAWING_ID,
        },
      ]);

      expect(dialogRefCloseSpy).toHaveBeenCalled();
    });
  }));
});
