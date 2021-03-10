/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { keyDown } from '@components/pages/editor/editor/editor.component.spec';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';
import { Tool } from '@tools/tool';
import { ToolType } from '@tools/tool-type.enum';

describe('EditorKeyboardListener', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let keyboardListener: KeyboardListenerService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, ToolbarModule],
      declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent],
      providers: [EditorService],
    }).compileComponents();
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

  it('should select the eraser tool when typing e', () => {
    keyboardListener.handle(keyDown('e'));
    expect(component.currentToolType).toEqual(ToolType.Eraser);
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
});
