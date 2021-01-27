/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import createSpy = jasmine.createSpy;
import { SharedModule } from 'src/app/components/shared/shared.module';
import { EditorService } from 'src/app/services/editor.service';
import { EditorModule } from '../../editor/editor.module';
import { EditorComponent } from '../../editor/editor/editor.component';
import { ExtensionType } from '../extension-type.enum';
import { FilterType } from '../filter-type.enum';
import { ExportModalComponent } from './export-modal.component';

describe('ExportModalComponent', () => {
  let component: ExportModalComponent;
  let fixture: ComponentFixture<ExportModalComponent>;
  let fixtureEditor: ComponentFixture<EditorComponent>;
  const dialogRefCloseSpy = createSpy('close');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, EditorModule, RouterTestingModule, FormsModule],
      declarations: [ExportModalComponent],
      providers: [EditorService, { provide: MatDialogRef, useValue: { close: dialogRefCloseSpy } }],
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ExportModalComponent] } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixtureEditor = TestBed.createComponent(EditorComponent);
    fixtureEditor.detectChanges();
    fixture = TestBed.createComponent(ExportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should return full file name with extension', () => {
    component.fileName = 'test';
    component.selectedExtension = ExtensionType.SVG;
    expect(component.fullName).toEqual('test.svg');
  });
  it('should call image export service safeURL for preview', () => {
    const spy = spyOn(component['imageExportService'], 'safeURL');
    // tslint:disable-next-line: no-unused-expression
    component.previewURL;
    expect(spy).toHaveBeenCalledWith(component['editorService'].view);
  });
  it('should add empty filter to the preview image', () => {
    component.selectedFilter = FilterType.EMPTY;
    component.addFilterToPreview();
    const image = fixture.debugElement.nativeElement.querySelector('#preview');
    expect(image.style.filter).toEqual('none');
  });
  it('should add black and white filter to the preview image', () => {
    component.selectedFilter = FilterType.BLACKWHITE;
    component.addFilterToPreview();
    const image = fixture.debugElement.nativeElement.querySelector('#preview');
    expect(image.style.filter).toEqual('grayscale(100%)');
  });
  it('should add blur filter to the preview image', () => {
    component.selectedFilter = FilterType.BLUR;
    component.addFilterToPreview();
    const image = fixture.debugElement.nativeElement.querySelector('#preview');
    expect(image.style.filter).toEqual('blur(5px)');
  });
  it('should invert colors of the preview image', () => {
    component.selectedFilter = FilterType.INVERT;
    component.addFilterToPreview();
    const image = fixture.debugElement.nativeElement.querySelector('#preview');
    expect(image.style.filter).toEqual('invert(100%)');
  });
  it('should saturate colors of the preview image', () => {
    component.selectedFilter = FilterType.SATURATE;
    component.addFilterToPreview();
    const image = fixture.debugElement.nativeElement.querySelector('#preview');
    expect(image.style.filter).toEqual('saturate(200%)');
  });
  it('should turn colors sepia of the preview image', () => {
    component.selectedFilter = FilterType.SEPIA;
    component.addFilterToPreview();
    const image = fixture.debugElement.nativeElement.querySelector('#preview');
    expect(image.style.filter).toEqual('sepia(100%)');
  });
  it('should call changeExtension when adding a filter', () => {
    const spy = spyOn(component, 'changeExtension');
    component.addFilterToPreview();
    expect(spy).toHaveBeenCalled();
  });
  it('should not call export svg and export image from imageExportService', () => {
    component.selectedExtension = ExtensionType.EMPTY;
    const spySvg = spyOn(component['imageExportService'], 'exportSVGElement');
    const spyImage = spyOn(component['imageExportService'], 'exportImageElement');
    component.changeExtension();
    expect(spySvg).not.toHaveBeenCalled();
    expect(spyImage).not.toHaveBeenCalled();
  });
  it('should call export svg and not export image from imageExportService', () => {
    component.selectedExtension = ExtensionType.SVG;
    const spySvg = spyOn(component['imageExportService'], 'exportSVGElement');
    const spyImage = spyOn(component['imageExportService'], 'exportImageElement');
    component.changeExtension();
    expect(spySvg).toHaveBeenCalled();
    expect(spyImage).not.toHaveBeenCalled();
  });
  it('should not call export svg and call export image from imageExportService', () => {
    component.selectedExtension = ExtensionType.PNG;
    const spySvg = spyOn(component['imageExportService'], 'exportSVGElement');
    const spyImage = spyOn(component['imageExportService'], 'exportImageElement').and.returnValue(Promise.resolve(''));
    component.changeExtension();
    expect(spySvg).not.toHaveBeenCalled();
    expect(spyImage).toHaveBeenCalled();
  });
});
