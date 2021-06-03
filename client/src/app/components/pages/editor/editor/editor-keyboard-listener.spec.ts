import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { keyDown } from '@components/pages/editor/editor/editor.component.spec';
import { SharedModule } from '@components/shared/shared.module';
import { APIService } from '@services/api.service';
import { MockAPIService } from '@services/api.service.spec';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';
import { Tool } from '@tools/tool';
import { ToolType } from '@tools/tool-type.enum';
import { EditorModule } from '../editor.module';

describe('EditorKeyboardListener', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let keyboardListener: KeyboardListenerService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([{ path: 'login', redirectTo: '' }]), SharedModule, EditorModule],
        providers: [
          { provide: EditorService, useClass: MockEditorService },
          { provide: APIService, useValue: MockAPIService },
          { provide: UserService, useValue: MockUserService },
          { provide: GameService, useValue: MockGameService },
          { provide: ChatService, useValue: MockChatService },
          { provide: SocketService, useValue: MockSocketService },
        ],
      }).compileComponents();
    }),
  );

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
});
