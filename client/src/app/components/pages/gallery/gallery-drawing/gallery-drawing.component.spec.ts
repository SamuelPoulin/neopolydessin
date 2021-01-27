// tslint:disable: no-string-literal
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { Drawing } from '@models/drawing';
import { GalleryModule } from '../gallery.module';
import { GalleryDrawingComponent } from './gallery-drawing.component';

describe('Gallery Drawing Component', () => {
  let component: GalleryDrawingComponent;
  let fixture: ComponentFixture<GalleryDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GalleryModule, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryDrawingComponent);
    component = fixture.componentInstance;
    component.drawing = new Drawing('', [], '', '', 0, 0, '', '123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call deleteDrawing delete button pressed', () => {
    const spy = spyOn(component['apiService'], 'deleteDrawing');

    fixture.debugElement.nativeElement.querySelector('#delete-button').click();

    expect(spy).toHaveBeenCalled();
  });

  it('should call chosen.emit on choose button pressed', () => {
    const spy = spyOn(component['chosen'], 'emit');

    fixture.debugElement.nativeElement.querySelector('#choose-button').click();

    expect(spy).toHaveBeenCalled();
  });
});
