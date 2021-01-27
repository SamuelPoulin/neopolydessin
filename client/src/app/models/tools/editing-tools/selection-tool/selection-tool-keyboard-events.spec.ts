/* tslint:disable:no-string-literal no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { keyDown, keyUp } from '@components/pages/editor/editor/editor.component.spec';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { SelectionTool } from '@tools/editing-tools/selection-tool/selection-tool';

describe('SelectionToolKeyboardEvents', () => {
  let selectionTool: SelectionTool;
  let keyboardListener: KeyboardListenerService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [EditorService],
    }).compileComponents();

    selectionTool = new SelectionTool(TestBed.get(EditorService));
    keyboardListener = selectionTool['keyboardListener'];
  });

  it('can handle move up events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyUp('ArrowUp'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(0, false);
  });

  it('can handle move right events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyUp('ArrowRight'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(1, false);
  });
  it('can handle move down events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyUp('ArrowDown'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(2, false);
  });
  it('can handle move left events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyUp('ArrowLeft'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(3, false);
  });

  it('can handle move up keydown events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyDown('ArrowUp'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(0, true);
  });

  it('can handle move right keydown events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyDown('ArrowRight'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(1, true);
  });
  it('can handle move down keydown events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyDown('ArrowDown'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(2, true);
  });
  it('can handle move left keydown events', () => {
    const handleKeyboardMoveSpy = spyOn(selectionTool, 'handleKeyboardMove');
    keyboardListener.handle(keyDown('ArrowLeft'));
    expect(handleKeyboardMoveSpy).toHaveBeenCalledWith(3, true);
  });

  it('can handle modifier keys', () => {
    keyboardListener.handle(keyUp('shift', false));
    expect(selectionTool['shiftKey']).toBeFalsy();

    keyboardListener.handle(keyDown('shift', true));
    expect(selectionTool['shiftKey']).toBeTruthy();

    keyboardListener.handle(keyDown('alt', false, false, true));
    expect(selectionTool['altKey']).toBeTruthy();

    keyboardListener.handle(keyUp('alt', false, false, true));
    expect(selectionTool['altKey']).toBeFalsy();

    keyboardListener.handle(keyDown('alt', true, false, true));
    expect(selectionTool['altKey']).toBeTruthy();

    keyboardListener.handle(keyUp('alt', true, false, true));
    expect(selectionTool['altKey']).toBeFalsy();
  });
});
