/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EraserToolbarComponent } from '@components/pages/editor/toolbar/eraser-toolbar/eraser-toolbar.component';
import { GridToolbarComponent } from '@components/pages/editor/toolbar/grid-toolbar/grid-toolbar.component';
import { ToolbarType } from '@components/pages/editor/toolbar/toolbar/toolbar-type.enum';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { PenToolbarComponent } from 'src/app/components/pages/editor/toolbar/pen-toolbar/pen-toolbar.component';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { Color } from 'src/app/utils/color/color';
import createSpyObj = jasmine.createSpyObj;

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ToolbarComponent, PenToolbarComponent, EraserToolbarComponent, GridToolbarComponent],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the pen tool', () => {
    fixture.debugElement.nativeElement.querySelector('#btn-pen-tool').click();
    fixture.detectChanges();

    expect(component.currentToolType).toBe(ToolType.Pen);
  });

  it('should select the primary color and the secondary color when clicking associated squares', () => {
    const primaryColorSquare = fixture.debugElement.nativeElement.querySelector('#toolbar-primary-color');
    const secondaryColorSquare = fixture.debugElement.nativeElement.querySelector('#toolbar-secondary-color');

    secondaryColorSquare.click();

    expect(component.selectedColor).toEqual(1);

    primaryColorSquare.click();

    expect(component.selectedColor).toEqual(0);
  });

  it('should show the correct primary color in the square when a new color is picked', () => {
    const primaryColorSquare = fixture.debugElement.nativeElement.querySelector('#toolbar-primary-color');
    primaryColorSquare.click();
    fixture.detectChanges();

    component.colorPicker.color = Color.BLUE;
    component.colorPicker.colorChanged.emit(component.colorPicker.color);

    expect(component.primaryColor.hexString).toEqual(Color.BLUE.hexString);
  });

  it('should show the correct secondary color in the square when a new color is picked', () => {
    const secondaryColorSquare = fixture.debugElement.nativeElement.querySelector('#toolbar-secondary-color');
    secondaryColorSquare.click();
    fixture.detectChanges();

    component.colorPicker.color = Color.GREEN;
    component.colorPicker.colorChanged.emit(component.colorPicker.color);

    expect(component.secondaryColor.hexString).toEqual(Color.GREEN.hexString);
  });

  it('can get toolbar icons', () => {
    expect(component.toolbarIcons.get(ToolType.Pen)).toEqual('edit');
  });

  it('can open/close drawer', () => {
    const drawerSpy = createSpyObj('drawer', ['open', 'close']);
    drawerSpy.open.and.callFake(() => {
      component['drawer'].opened = true;
    });

    drawerSpy.close.and.callFake(() => {
      component['drawer'].opened = false;
    });

    component['drawer'] = drawerSpy;

    component.open();
    expect(component.drawerOpened).toBeTruthy();
    component.close();
    expect(component.drawerOpened).toBeFalsy();
  });

  it('can edit grid', () => {
    const drawerSpy = createSpyObj('drawer', ['open', 'close']);
    drawerSpy.open.and.callFake(() => {
      component['drawer'].opened = true;
    });

    component.editGrid();
    expect(component.drawerOpened).toBeTruthy();
    expect(component.toolbarType).toEqual(ToolbarType.grid);
  });

  it('can open choose export save', () => {
    const emitSpy = spyOn(component.chooseExportSaveButtonClicked, 'emit');
    component.openChooseExportSave();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should undo command', () => {
    const undoSpy = spyOn(component.editorService.commandReceiver, 'undo');
    component.undo();
    expect(undoSpy).toHaveBeenCalled();
  });

  it('should redo command', () => {
    const redoSpy = spyOn(component.editorService.commandReceiver, 'redo');
    component.redo();
    expect(redoSpy).toHaveBeenCalled();
  });
});
