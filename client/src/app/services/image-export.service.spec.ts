/*tslint:disable:no-string-literal no-magic-numbers*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { FilterType } from '@components/pages/export-modal/filter-type.enum';
import { EditorUtils } from '@utils/color/editor-utils';
import { EditorModule } from 'src/app/components/pages/editor/editor.module';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { EditorService } from 'src/app/services/editor.service';
import { ImageExportService } from './image-export.service';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('ImageExportService', () => {
  let service: ImageExportService;
  let fixture: ComponentFixture<EditorComponent>;
  let domSanitizer: SpyObj<DomSanitizer>;
  let xmlSerializer: XMLSerializer;

  beforeEach(async(() => {
    domSanitizer = createSpyObj<DomSanitizer>('domSanitizer', ['bypassSecurityTrustResourceUrl', 'sanitize']);
    TestBed.configureTestingModule({
      declarations: [],
      imports: [SharedModule, RouterTestingModule, EditorModule],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    service = new ImageExportService(domSanitizer);
    xmlSerializer = new XMLSerializer();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should call addFilter when exporting svg', () => {
    const addFilterSpy = spyOn(EditorUtils, 'addFilter');
    const safeURLSpy = spyOn(service, 'safeURL');
    const removeFilterSpy = spyOn(EditorUtils, 'removeFilter');
    const filter = FilterType.BLACKWHITE;
    service.exportSVGElement(fixture.componentInstance.drawingSurface, filter);
    expect(addFilterSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface, filter);
    expect(safeURLSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface);
    expect(removeFilterSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface);
  });
  it('should return safe data URL when exporting svg', () => {
    const filter = FilterType.BLACKWHITE;
    const returnValue = service.exportSVGElement(fixture.componentInstance.drawingSurface, filter);
    expect(returnValue).toEqual(service.safeURL(fixture.componentInstance.drawingSurface));
  });
  it('should call bypassSecurityTrustResourceUrl and createDataURL when securing data URL', () => {
    const createDataSpy = spyOn(EditorUtils, 'createDataURL');
    service.safeURL(fixture.componentInstance.drawingSurface);
    expect(createDataSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface);
    // tslint:disable-next-line: max-line-length
    expect(domSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
      EditorUtils.createDataURL(fixture.componentInstance.drawingSurface),
    );
  });
  it('should return safe URL when safe url called', () => {
    const returnValue = service.safeURL(fixture.componentInstance.drawingSurface);
    // tslint:disable-next-line: max-line-length
    expect(returnValue).toEqual(
      domSanitizer.bypassSecurityTrustResourceUrl(EditorUtils.createDataURL(fixture.componentInstance.drawingSurface)),
    );
  });
  it('should return encoded dataURL', () => {
    const returnValue = EditorUtils.createDataURL(fixture.componentInstance.drawingSurface);
    // tslint:disable-next-line: max-line-length
    expect(returnValue).toEqual(
      'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(fixture.componentInstance.drawingSurface.svg)),
    );
  });
  it('should remove filter should set filter to none', () => {
    const filter = FilterType.BLACKWHITE;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    EditorUtils.removeFilter(fixture.componentInstance.drawingSurface);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual(null);
  });
  it('should set filter to none when choosing empty filter', () => {
    const filter = FilterType.EMPTY;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual('none');
  });
  it('should set filter to black and white when choosing black and white filter', () => {
    const filter = FilterType.BLACKWHITE;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual('grayscale(100%)');
  });
  it('should blur image when choosing blur filter', () => {
    const filter = FilterType.BLUR;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual('blur(5px)');
  });
  it('should invert image colors when choosing invert filter', () => {
    const filter = FilterType.INVERT;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual('invert(100%)');
  });
  it('should saturate image colors when choosing saturate filter', () => {
    const filter = FilterType.SATURATE;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual('saturate(200%)');
  });
  it('should turn image colors sepia when choosing sepia filter', () => {
    const filter = FilterType.SEPIA;
    EditorUtils.addFilter(fixture.componentInstance.drawingSurface, filter);
    expect(fixture.componentInstance.drawingSurface.svg.getAttribute('filter')).toEqual('sepia(100%)');
  });
  it('should call addFilter and removeFilter when exporting image', (done) => {
    const addFilterSpy = spyOn(EditorUtils, 'addFilter');
    const removeFilterSpy = spyOn(EditorUtils, 'removeFilter');
    const filter = FilterType.BLACKWHITE;
    service.exportImageElement(fixture.componentInstance.drawingSurface, 'png', filter).then(() => {
      done();
    });

    expect(addFilterSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface, filter);
    expect(removeFilterSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface);
  });
  it('should call addFilter when sending svg', () => {
    const addFilterSpy = spyOn(EditorUtils, 'addFilter');
    const uRLSpy = spyOn(EditorUtils, 'createSerializedString');
    const removeFilterSpy = spyOn(EditorUtils, 'removeFilter');
    const filter = FilterType.BLACKWHITE;
    service.sendSVGElement(fixture.componentInstance.drawingSurface, filter);
    expect(addFilterSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface, filter);
    expect(uRLSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface);
    expect(removeFilterSpy).toHaveBeenCalledWith(fixture.componentInstance.drawingSurface);
  });
  it('should return non encoded dataURL', () => {
    const returnValue = EditorUtils.createSerializedString(fixture.componentInstance.drawingSurface);
    // tslint:disable-next-line: max-line-length
    expect(returnValue).toEqual(xmlSerializer.serializeToString(fixture.componentInstance.drawingSurface.svg));
  });
});
