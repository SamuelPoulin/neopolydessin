import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AbstractModalComponent } from './abstract-modal.component';

describe('AbstractModalComponent', () => {
  let component: AbstractModalComponent;
  let fixture: ComponentFixture<AbstractModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatDialogModule, MatFormFieldModule],
        declarations: [AbstractModalComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: {} },
          {
            provide: MatDialogRef,
            useValue: {
              close: () => {
                return;
              },
            },
          },
        ],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close on close button click', () => {
    const dialogSpy = spyOn(component.dialogRef, 'close');
    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('#btn-close');

    expect(dialogSpy).not.toHaveBeenCalled();
    closeButton.click();
    expect(dialogSpy).toHaveBeenCalled();
  });
});
