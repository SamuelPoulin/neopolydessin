import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import createSpy = jasmine.createSpy;
import { ModalType } from '@services/modal/modal-type.enum';
import { SharedModule } from '../../../shared/shared.module';
import { ChooseExportSaveModalComponent } from './choose-export-save-modal.component';

describe('ChooseExportSaveModal', () => {
  let component: ChooseExportSaveModalComponent;
  let fixture: ComponentFixture<ChooseExportSaveModalComponent>;
  const dialogRefCloseSpy = createSpy('close');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ChooseExportSaveModalComponent],
      providers: [{ provide: MatDialogRef, useValue: { close: dialogRefCloseSpy } }],
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ChooseExportSaveModalComponent] } })
      .compileComponents();
  }));
  beforeEach(() => {
    (fixture = TestBed.createComponent(ChooseExportSaveModalComponent)), (component = fixture.componentInstance);
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call openSave when clicking save button', () => {
    const spy = spyOn(component, 'openSave');
    fixture.debugElement.nativeElement.querySelector('#saveButton').click();
    expect(spy).toHaveBeenCalled();
  });
  it('should call openExport when clicking save button', () => {
    const spy = spyOn(component, 'openExport');
    fixture.debugElement.nativeElement.querySelector('#exportButton').click();
    expect(spy).toHaveBeenCalled();
  });
  it('should close modal when choosing save', () => {
    component.openSave();
    expect(dialogRefCloseSpy).toHaveBeenCalledWith(ModalType.SAVE);
  });
  it('should close modal when choosing export', () => {
    component.openExport();
    expect(dialogRefCloseSpy).toHaveBeenCalledWith(ModalType.EXPORT);
  });
});
