import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';

import { ConfirmModalComponent } from './confirm-modal.component';
import createSpy = jasmine.createSpy;

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;
  const dialogRefCloseSpy = createSpy('close');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmModalComponent, AbstractModalComponent],
      providers: [{ provide: MatDialogRef, useValue: { close: dialogRefCloseSpy } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes the dialog on confirm button clicked', () => {
    fixture.debugElement.nativeElement.querySelector('#btn-confirm').click();

    expect(dialogRefCloseSpy).toHaveBeenCalledWith(true);
  });
});
