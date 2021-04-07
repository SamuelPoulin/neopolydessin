/* tslint:disable:no-any */
import { Overlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/components/shared/abstract-modal/confirm-modal/confirm-modal/confirm-modal.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ModalType } from 'src/app/services/modal/modal-type.enum';

import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import Spy = jasmine.Spy;

fdescribe('ModalDialogService', () => {
  let service: ModalDialogService;
  let openSpy: Spy;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [Overlay, Injector],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(ModalDialogService);
    openSpy = spyOn(service, 'open').and.callFake(
      (): MatDialogRef<any> => {
        service.openDialogs.push({} as any);
        return null as any;
      },
    );
    spyOn(service, 'closeAll').and.callFake(() => {
      service.openDialogs.length = 0;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not open a modal if invalid dialog name', () => {
    service.openByName('INVALID_NAME' as ModalType);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('can open confirm dialog', () => {
    service.openByName(ModalType.CONFIRM);
    expect(openSpy).toHaveBeenCalledWith(ConfirmModalComponent, {});
  });
});
