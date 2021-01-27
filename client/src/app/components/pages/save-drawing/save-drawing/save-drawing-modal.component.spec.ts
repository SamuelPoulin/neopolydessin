/* tslint:disable:no-string-literal */
import { SecurityContext } from '@angular/core';
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
import { SaveDrawingModalComponent } from './save-drawing-modal.component';

describe('SaveDrawingModalComponent', () => {
  let component: SaveDrawingModalComponent;
  let fixture: ComponentFixture<SaveDrawingModalComponent>;
  let fixtureEditor: ComponentFixture<EditorComponent>;
  const dialogRefCloseSpy = createSpy('close');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, EditorModule, RouterTestingModule, FormsModule],
      declarations: [SaveDrawingModalComponent],
      providers: [EditorService, { provide: MatDialogRef, useValue: { close: dialogRefCloseSpy } }],
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [SaveDrawingModalComponent] } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixtureEditor = TestBed.createComponent(EditorComponent);
    fixtureEditor.detectChanges();
    fixture = TestBed.createComponent(SaveDrawingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should grow the length of tag array', () => {
    const originalLength = component.tags.length;
    component.addTag();
    expect(component.tags.length).toEqual(originalLength + 1);
  });
  it('should shorten the length of tag array', () => {
    const originalLength = component.tags.length;
    component.removeTag();
    expect(component.tags.length).toEqual(originalLength - 1);
  });
  it('should call image export service safeURL for preview', () => {
    const spy = spyOn(component['imageExportService'], 'safeURL');
    // tslint:disable-next-line: no-unused-expression
    component.previewURL;
    expect(spy).toHaveBeenCalledWith(component['editorService'].view);
  });
  it('should sanitize the dataURL string', () => {
    const spy = spyOn(component['apiService'], 'uploadDrawing');
    const sanitizeSpy = spyOn(component['sanitizer'], 'sanitize');
    component.saveDrawing();
    expect(sanitizeSpy).toHaveBeenCalledWith(SecurityContext.RESOURCE_URL, component.previewURL);
    expect(spy).toHaveBeenCalled();
    expect(dialogRefCloseSpy).toHaveBeenCalled();
  });

  it('should call removeTag when clicking remove button', () => {
    const spy = spyOn(component, 'removeTag');
    fixture.debugElement.nativeElement.querySelector('#btn-remove').click();
    expect(spy).toHaveBeenCalled();
  });
  it('should call addTag when clicking add button', () => {
    const spy = spyOn(component, 'addTag');
    fixture.debugElement.nativeElement.querySelector('#btn-add').click();
    expect(spy).toHaveBeenCalled();
  });
});
