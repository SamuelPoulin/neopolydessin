/* tslint:disable:no-any */
import { Overlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { CreateDrawingModalComponent } from 'src/app/components/pages/home/create-drawing-modal/create-drawing-modal.component';
import { UserGuideModalComponent } from 'src/app/components/pages/user-guide/user-guide/user-guide-modal.component';
import { ConfirmModalComponent } from 'src/app/components/shared/abstract-modal/confirm-modal/confirm-modal/confirm-modal.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ModalType } from 'src/app/services/modal/modal-type.enum';

import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import Spy = jasmine.Spy;

describe('ModalDialogService', () => {
  let service: ModalDialogService;
  let openSpy: Spy;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [Overlay, Injector],
    }),
  );

  beforeEach(() => {
    service = TestBed.get(ModalDialogService);
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

  it('should not open modal if already opened', () => {
    service.openByName(ModalType.GUIDE);
    service.openByName(ModalType.CREATE);
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(UserGuideModalComponent, {});
  });

  it('can open confirm dialog', () => {
    service.openByName(ModalType.CONFIRM);
    expect(openSpy).toHaveBeenCalledWith(ConfirmModalComponent, {});
  });

  it('should open second modal after first one is closed', () => {
    service.openByName(ModalType.CREATE);
    expect(service.modalIsOpened).toEqual(true);
    expect(openSpy).toHaveBeenCalledWith(CreateDrawingModalComponent, {});

    service.closeAll();
    expect(service.modalIsOpened).toEqual(false);

    service.openByName(ModalType.GUIDE);
    expect(openSpy).toHaveBeenCalledTimes(2);
  });
});
