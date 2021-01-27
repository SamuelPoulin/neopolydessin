/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateDrawingModalComponent } from 'src/app/components/pages/home/create-drawing-modal/create-drawing-modal.component';
import { UserGuideModalComponent } from 'src/app/components/pages/user-guide/user-guide/user-guide-modal.component';
import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import { ModalType } from 'src/app/services/modal/modal-type.enum';
import { SharedModule } from '../../../shared/shared.module';

import { HomeComponent } from './home.component';
import createSpyObj = jasmine.createSpyObj;

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const routerSpy = createSpyObj('Router', ['navigate']);
  const modalDialogServiceSpy = createSpyObj('ModalDialogService', ['openByName']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [HomeComponent, CreateDrawingModalComponent, UserGuideModalComponent],
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: ModalDialogService,
          useValue: modalDialogServiceSpy,
        },
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [CreateDrawingModalComponent, UserGuideModalComponent] } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openModal on create button clicked', () => {
    const openModalSpy = spyOn(component, 'openModal');
    fixture.debugElement.nativeElement.querySelector('#btn-create').click();
    expect(openModalSpy).toHaveBeenCalled();
  });

  it('should open modal when openModal is called', () => {
    component.openModal();
    expect(component['dialog'].openByName).toHaveBeenCalledWith(ModalType.CREATE);
  });

  it('should open guide modal correctly', () => {
    component.openModal(ModalType.GUIDE);
    expect(component['dialog'].openByName).toHaveBeenCalledWith(ModalType.GUIDE);
  });

  it('should call openModal on guide button clicked', () => {
    const openModalSpy = spyOn(component, 'openModal');
    fixture.debugElement.nativeElement.querySelector('#btn-guide').click();
    expect(openModalSpy).toHaveBeenCalledWith('help');
  });

  it('should call openGallery on gallery button clicked', () => {
    const openGallerySpy = spyOn(component, 'openGallery').and.callThrough();
    fixture.debugElement.nativeElement.querySelector('#btn-gallery').click();
    expect(openGallerySpy).toHaveBeenCalled();
  });

  it('should route', () => {
    component.openPage('test');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['test']);
  });

  /* keyboard shortcuts */

  it('should handle keyboard event', () => {
    const keyDownSpy = spyOn(component['keyboardListener'], 'handle');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    expect(keyDownSpy).toHaveBeenCalled();
  });

  it('can open modal with keyboard shortcut', () => {
    const openModalSpy = spyOn(component, 'openModal');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', ctrlKey: true }));
    expect(openModalSpy).toHaveBeenCalled();
  });

  it('can open gallery with keyboard shortcut', () => {
    const openGallerySpy = spyOn(component, 'openGallery');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true }));
    expect(openGallerySpy).toHaveBeenCalled();
  });
});
