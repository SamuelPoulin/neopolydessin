// tslint:disable: no-magic-numbers
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@components/shared/shared.module';
import { Drawing } from '@models/drawing';
import { APIService } from '@services/api.service';
import { GalleryModule } from '../gallery.module';
import { GalleryModalComponent } from './gallery-modal.component';

describe('Gallery Modal Component', () => {
  const dialogRefCloseSpy = jasmine.createSpy('close');
  const routerSpy = jasmine.createSpyObj('Router', {
    navigate: new Promise<boolean>(() => {
      return;
    }),
  });
  let component: GalleryModalComponent;
  let fixture: ComponentFixture<GalleryModalComponent>;
  let getAllDrawingsSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, GalleryModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: dialogRefCloseSpy } },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryModalComponent);

    getAllDrawingsSpy = spyOn(APIService.prototype, 'getAllDrawings').and.returnValue(Promise.resolve([]));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route correctly when a drawing is chosen', (done) => {
    routerSpy.navigate.and.returnValue(Promise.resolve());

    const drawing = new Drawing('testDrawing', [], '', 'ff0000', 100, 100, '', '123');
    component.chooseDrawing(drawing);

    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        'edit',
        {
          width: '100',
          height: '100',
          color: 'ff0000',
          id: '123',
        },
      ]);
      done();

      expect(dialogRefCloseSpy).toHaveBeenCalled();
    });
  });

  it('should call getAllDrawings when fetchDrawings is called', () => {
    component.fetchDrawings();

    expect(getAllDrawingsSpy).toHaveBeenCalledTimes(2);
  });

  it('should call searchDrawings on updateDrawings', () => {
    const spy = spyOn(APIService.prototype, 'searchDrawings').and.returnValue(Promise.resolve([]));

    component.updateDrawings();

    expect(spy).toHaveBeenCalled();
  });
});
