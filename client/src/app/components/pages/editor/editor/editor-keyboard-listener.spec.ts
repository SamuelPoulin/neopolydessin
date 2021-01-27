/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { keyDown } from '@components/pages/editor/editor/editor.component.spec';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { CreateDrawingModalComponent } from '@components/pages/home/create-drawing-modal/create-drawing-modal.component';
import { UserGuideModalComponent } from '@components/pages/user-guide/user-guide/user-guide-modal.component';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';
import { SelectionTool } from '@tools/editing-tools/selection-tool/selection-tool';
import { Tool } from '@tools/tool';
import { ToolType } from '@tools/tool-type.enum';

describe('EditorKeyboardListener', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let keyboardListener: KeyboardListenerService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, ToolbarModule],
      declarations: [DrawingSurfaceComponent, UserGuideModalComponent, EditorComponent, GridComponent, CreateDrawingModalComponent],
      providers: [EditorService],
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [CreateDrawingModalComponent, UserGuideModalComponent] } })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    keyboardListener = component['keyboardListener'];
    fixture.detectChanges();
  });

  it('should catch a keyboard event on keydown', () => {
    const spy = spyOn(keyboardListener, 'handle');
    const keydownEvent = new Event('keydown');
    window.dispatchEvent(keydownEvent);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should select the pen tool when typing c', () => {
    keyboardListener.handle(keyDown('c'));
    expect(component.currentToolType).toEqual(ToolType.Pen);
  });

  it('should pass down events when unknown keys are pressed', () => {
    const spy = spyOn(component.currentTool as Tool, 'handleKeyboardEvent');

    keyboardListener.handle(keyDown('x'));

    expect(spy).toHaveBeenCalled();
  });

  it('should select the brush tool when typing w', () => {
    keyboardListener.handle(keyDown('w'));
    expect(component.currentToolType).toEqual(ToolType.Brush);
  });

  it('should select the rectangle tool when typing 1', () => {
    keyboardListener.handle(keyDown('1'));
    expect(component.currentToolType).toEqual(ToolType.Rectangle);
  });

  it('should select the ellipse tool when typing 2', () => {
    keyboardListener.handle(keyDown('2'));
    expect(component.currentToolType).toEqual(ToolType.Ellipse);
  });

  it('should select the line tool when typing l', () => {
    keyboardListener.handle(keyDown('l'));
    expect(component.currentToolType).toEqual(ToolType.Line);
  });

  it('should select the pipette tool when typing i', () => {
    keyboardListener.handle(keyDown('i'));
    expect(component.currentToolType).toEqual(ToolType.Pipette);
  });

  it('should select the polygon tool when typing 3', () => {
    keyboardListener.handle(keyDown('3'));
    expect(component.currentToolType).toEqual(ToolType.Polygon);
  });

  it('should select the color applicator tool when typing r', () => {
    keyboardListener.handle(keyDown('r'));
    expect(component.currentToolType).toEqual(ToolType.ColorApplicator);
  });

  it('should select the eraser tool when typing e', () => {
    keyboardListener.handle(keyDown('e'));
    expect(component.currentToolType).toEqual(ToolType.Eraser);
  });

  it('should select the spray tool when typing a', () => {
    keyboardListener.handle(keyDown('a'));
    expect(component.currentToolType).toEqual(ToolType.Spray);
  });

  it('should select the color fill tool when typing b', () => {
    keyboardListener.handle(keyDown('b'));
    expect(component.currentToolType).toEqual(ToolType.ColorFill);
  });

  it('should decrement grid size when typing -', () => {
    component.editorService.gridProperties.size.value = 20;
    keyboardListener.handle(keyDown('-', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(15);
  });

  it('should decrement grid size and set to highest multiple of 5 when typing -', () => {
    component.editorService.gridProperties.size.value = 21;
    keyboardListener.handle(keyDown('-', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(20);
    component.editorService.gridProperties.size.value = 24;
    keyboardListener.handle(keyDown('-', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(20);
    component.editorService.gridProperties.size.value = 25;
    keyboardListener.handle(keyDown('-', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(20);
  });

  it('should increment grid size when typing +', () => {
    component.editorService.gridProperties.size.value = 20;
    keyboardListener.handle(keyDown('+', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(25);
  });

  it('should increment grid size and set to highest multiple of 5 when typing +', () => {
    component.editorService.gridProperties.size.value = 21;
    keyboardListener.handle(keyDown('+', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(25);
    component.editorService.gridProperties.size.value = 24;
    keyboardListener.handle(keyDown('+', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(25);
    component.editorService.gridProperties.size.value = 25;
    keyboardListener.handle(keyDown('+', false, false));
    expect(component.editorService.gridProperties.size.value).toEqual(30);
  });

  it('should set grid visible when typing g', () => {
    component.editorService.gridProperties.visibility.value = GridVisibility.hidden;
    keyboardListener.handle(keyDown('g', false, false));
    expect(component.editorService.gridProperties.visibility.value).toEqual(GridVisibility.visible);
  });

  it('should select selection tool on typing s', () => {
    keyboardListener.handle(keyDown('s'));
    expect(component.currentToolType).toEqual(ToolType.Select);
    const currentTool = component.currentTool as Tool;
    expect(currentTool.constructor.name).toEqual(SelectionTool.name);
  });

  it('should select all on ctrl a', () => {
    const selectAllSpy = spyOn(component.editorService['tools'].get(ToolType.Select) as SelectionTool, 'selectAll');
    keyboardListener.handle(keyDown('a', false, true));
    expect(selectAllSpy).toHaveBeenCalled();
  });

  it('should open export dialog on ctrl e', () => {
    const openDialogSpy = spyOn(component.dialog, 'openByName');
    keyboardListener.handle(keyDown('e', false, true));
    expect(openDialogSpy).toHaveBeenCalledWith('export');
  });

  it('should open save dialog on ctrl e', () => {
    const openDialogSpy = spyOn(component.dialog, 'openByName');
    keyboardListener.handle(keyDown('s', false, true));
    expect(openDialogSpy).toHaveBeenCalledWith('save');
  });

  it('can copy', () => {
    const copySpy = spyOn(component.editorService, 'copySelectedShapes');
    keyboardListener.handle(keyDown('c', false, true));
    expect(copySpy).toHaveBeenCalled();
  });

  it('can cut', () => {
    const cutSpy = spyOn(component.editorService, 'cutSelectedShapes');
    keyboardListener.handle(keyDown('x', false, true));
    expect(cutSpy).toHaveBeenCalled();
  });

  it('can paste ', () => {
    const pasteSpy = spyOn(component.editorService, 'pasteClipboard');
    keyboardListener.handle(keyDown('v', false, true));
    expect(pasteSpy).toHaveBeenCalled();
  });

  it('can duplicate', () => {
    const dulicateSpy = spyOn(component.editorService, 'duplicateSelectedShapes');
    keyboardListener.handle(keyDown('d', false, true));
    expect(dulicateSpy).toHaveBeenCalled();
  });

  it('can delete', () => {
    const deleteSpy = spyOn(component.editorService, 'deleteSelectedShapes');
    keyboardListener.handle(keyDown('delete', false, false));
    expect(deleteSpy).toHaveBeenCalled();
  });
});
