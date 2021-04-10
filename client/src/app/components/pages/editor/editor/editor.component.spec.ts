/*tslint:disable:no-string-literal no-magic-numbers max-file-line-count*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { of } from 'rxjs';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { mouseDown } from '@models/tools/creator-tools/pen-tool/pen-tool.spec';
import { Tool } from 'src/app/models/tools/tool';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';
import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import { ModalType } from 'src/app/services/modal/modal-type.enum';
import { Color } from 'src/app/utils/color/color';
import { SharedModule } from '../../../shared/shared.module';
import { DrawingSurfaceComponent } from '../drawing-surface/drawing-surface.component';
import { EditorComponent } from './editor.component';
import createSpyObj = jasmine.createSpyObj;
import { ChatModule } from '@components/pages/chat/chat.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { MockEditorService } from '@services/editor.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';

export const keyDown = (key: string, shiftKey: boolean = false, ctrlKey: boolean = false, altKey: boolean = false): KeyboardEvent => {
  return {
    key,
    type: 'keydown',
    shiftKey,
    ctrlKey,
    altKey,
    preventDefault(): void {
      return;
    },
  } as KeyboardEvent;
};

export const keyUp = (key: string, shiftKey: boolean = false, ctrlKey: boolean = false, altKey: boolean = false): KeyboardEvent => {
  return {
    key,
    type: 'keyup',
    shiftKey,
    ctrlKey,
    altKey,
    preventDefault(): void {
      return;
    },
  } as KeyboardEvent;
};

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  const modalDialogServiceSpy = createSpyObj('ModalDialogService', {
    openByName: { afterClosed: () => of(true) },
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'login', redirectTo: '' }]),
        SharedModule,
        ToolbarModule,
        ChatModule,
        StatusBarModule,
      ],
      declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent],
      providers: [
        { provide: EditorService, useClass: MockEditorService },
        { provide: UserService, useValue: MockUserService },
        { provide: GameService, useValue: MockGameService },
        { provide: ChatService, useValue: MockChatService },
        { provide: SocketService, useValue: MockSocketService },
        {
          provide: ModalDialogService,
          useValue: modalDialogServiceSpy,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    modalDialogServiceSpy.openByName.calls.reset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changes background color on event emitted from toolbar', () => {
    const changeBackgroundSpy = spyOn(component, 'changeBackground').and.callThrough();
    const toolbar: ToolbarComponent = fixture.debugElement.query(By.css('#toolbar')).componentInstance;
    toolbar.editorBackgroundChanged.emit(Color.RED);
    expect(component.drawingSurface.color).toEqual(Color.RED);
    expect(changeBackgroundSpy).toHaveBeenCalled();
  });

  it('should cancel current drawing on tool change', () => {
    component.currentToolType = ToolType.Pen;
    const cancelSpy = spyOn(component.editorService.tools.get(ToolType.Pen) as Tool, 'cancel');
    component.currentToolType = ToolType.Eraser;
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('can get current tool', () => {
    class ToolImpl extends Tool {
      type: string;
      constructor(editorService: EditorService, type: string) {
        super(editorService);
        this.type = type;
      }

      initMouseHandler(): void {
        return;
      }
    }

    const tool: ToolImpl = new ToolImpl(TestBed.inject(EditorService), 'toolMock');
    component.editorService.tools.set('toolMock' as ToolType, tool);

    component.currentToolType = 'toolMock' as ToolType;

    const currentTool = component.currentTool as Tool;
    expect(currentTool).toEqual(tool);
    expect(currentTool.constructor.name).toEqual(ToolImpl.name);
    expect((currentTool as ToolImpl).type).toEqual('toolMock');
  });

  it('handles mouse event', () => {
    const tool: Tool = component.editorService.tools.get(component.currentToolType) as Tool;
    const handleMouseEventSpy = spyOn(tool, 'handleMouseEvent');
    const event = mouseDown();

    component.handleMouseEvent(event);

    expect(handleMouseEventSpy).toHaveBeenCalledWith(event);
  });

  it('prevents default on right click', () => {
    const handleMouseEventSpy = spyOn(component, 'handleMouseEvent').and.callThrough();
    const event = createSpyObj<MouseEvent>('event', ['preventDefault']);
    component.handleMouseEvent({ ...event, type: 'contextmenu' });

    expect(handleMouseEventSpy).toHaveBeenCalledWith({ ...event, type: 'contextmenu' });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('can call openCreateModal with keyboard shortcut', () => {
    const openModalSpy = spyOn(component, 'openCreateModal').and.callThrough();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', ctrlKey: true }));
    expect(openModalSpy).toHaveBeenCalled();
  });

  it('can open create modal if user confirms', () => {
    modalDialogServiceSpy.openByName.and.returnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<AbstractModalComponent>);

    component.openCreateModal();
    expect(modalDialogServiceSpy.openByName).toHaveBeenCalledWith(ModalType.CONFIRM);
    expect(modalDialogServiceSpy.openByName).toHaveBeenCalledWith(ModalType.CREATE);
  });

  it('does not open create modal if user cancels', () => {
    modalDialogServiceSpy.openByName.and.returnValue({
      afterClosed: () => of(false),
    } as MatDialogRef<AbstractModalComponent>);
    component.openCreateModal();
    expect(modalDialogServiceSpy.openByName).toHaveBeenCalledWith(ModalType.CONFIRM);
    expect(modalDialogServiceSpy.openByName).not.toHaveBeenCalledWith(ModalType.CREATE);
  });

  it('opens dialog on openGuide', () => {
    component.openGuide();
    expect(modalDialogServiceSpy.openByName).toHaveBeenCalledWith(ModalType.GUIDE);
  });

  it('should undo on ctrl z', () => {
    const undoSpy = spyOn(component.editorService.commandReceiver, 'undo');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
    expect(undoSpy).toHaveBeenCalled();
  });

  it('should redo on ctrl shift z', () => {
    const undoSpy = spyOn(component.editorService.commandReceiver, 'redo');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true }));
    expect(undoSpy).toHaveBeenCalled();
  });

  it('disables keyboardListener when toolbar is opened', () => {
    const toolbarOpenSpy = spyOn(component.toolbar, 'open');
    component.setToolbarState(true);
    expect(toolbarOpenSpy).toHaveBeenCalled();
    expect(component['keyboardListener'].listening).toEqual(false);
  });

  it('enables keyboardListener when toolbar is closed', () => {
    const toolbarClosedSpy = spyOn(component.toolbar, 'close');
    component.setToolbarState(false);
    expect(toolbarClosedSpy).toHaveBeenCalled();
    expect(component['keyboardListener'].listening).toEqual(true);
  });
});
