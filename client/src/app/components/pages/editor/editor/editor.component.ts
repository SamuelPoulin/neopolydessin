import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameType } from '@common/communication/lobby';
import { EditorKeyboardListener } from '@components/pages/editor/editor/editor-keyboard-listener';
import { Drawing } from '@models/drawing';
import { APIService } from '@services/api.service';
import { ChatService } from '@services/chat.service';
import { GameService } from '@services/game.service';
import { format } from 'date-fns';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { Tool } from 'src/app/models/tools/tool';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';
import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import { ModalType } from 'src/app/services/modal/modal-type.enum';
import { Color } from 'src/app/utils/color/color';
import { DrawingSurfaceComponent } from '../drawing-surface/drawing-surface.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('drawingSurface')
  drawingSurface: DrawingSurfaceComponent;

  @ViewChild('toolbar') toolbar: ToolbarComponent;

  private _currentToolType: ToolType;
  private keyboardListener: EditorKeyboardListener;

  surfaceColor: Color;
  surfaceWidth: number;
  surfaceHeight: number;
  drawingId: string;
  drawing: Drawing;
  modalTypes: typeof ModalType;
  timeLeft: string;

  constructor(
    private route: ActivatedRoute,
    public editorService: EditorService,
    public gameService: GameService,
    public dialog: ModalDialogService,
    private apiService: APIService,
    public chatService: ChatService,
  ) {
    this.chatService.resetGameMessages();

    this.surfaceColor = DrawingSurfaceComponent.DEFAULT_COLOR;
    this.surfaceWidth = DrawingSurfaceComponent.DEFAULT_WIDTH;
    this.surfaceHeight = DrawingSurfaceComponent.DEFAULT_HEIGHT;
    this.modalTypes = ModalType;
    this.keyboardListener = new EditorKeyboardListener(this);

    this.currentToolType = ToolType.Pen;

    setInterval(() => this.updateTimeLeft(), GameService.SECOND);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.surfaceWidth = params.width ? +params.width : this.surfaceWidth;
      this.surfaceHeight = params.height ? +params.height : this.surfaceHeight;
      this.surfaceColor = params.color ? Color.hex(params.color) : this.surfaceColor;
      this.drawingId = params.id;
    });
    this.editorService.setReady();
  }

  ngAfterViewInit(): void {
    this.editorService.resetDrawing();
    this.editorService.initListeners();
    this.editorService.view = this.drawingSurface;
    if (this.drawingId) {
      this.editorService.importDrawingById(this.drawingId, this.apiService);
    }
  }

  ngOnDestroy(): void {
    this.editorService.isFreeEdit = false;
  }

  handleMouseEvent(e: MouseEvent): void {
    if (this.currentTool) {
      this.currentTool.handleMouseEvent(e);
    }
  }

  changeBackground(color: Color): void {
    this.drawingSurface.color = color;
  }

  @HostListener('window:keydown', ['$event'])
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (this.gameService.canDraw) {
      this.keyboardListener.handle(event);
    }
  }

  saveDrawing(): void {
    this.dialog.openByName(ModalType.UPLOAD, { id: 'drawing' });
  }

  setToolbarState(opened: boolean): void {
    if (opened) {
      this.toolbar.open();
    } else {
      this.toolbar.close();
    }
    this.keyboardListener.listening = !opened;
  }

  get currentTool(): Tool | undefined {
    return this.editorService.tools.get(this.currentToolType);
  }

  get currentToolType(): ToolType {
    return this._currentToolType;
  }

  set currentToolType(value: ToolType) {
    if (this.currentTool) {
      this.currentTool.cancel();
    }
    this._currentToolType = value;
    if (this.currentTool) {
      this.currentTool.onSelect();
    }
  }

  updateTimeLeft(): void {
    this.timeLeft = format(new Date(this.gameService.getTimeLeft()), 'mm:ss');
  }

  get hint(): string {
    return this.gameService.wordToDraw ? 'Le mot à dessiner est' : '';
  }

  get loading(): boolean {
    return this.editorService.loading;
  }

  get splitTeams(): boolean {
    return this.gameService.gameType === GameType.CLASSIC;
  }
}
