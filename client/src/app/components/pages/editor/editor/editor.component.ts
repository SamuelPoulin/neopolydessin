import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorKeyboardListener } from '@components/pages/editor/editor/editor-keyboard-listener';
import { Drawing } from '@models/drawing';
import { APIService } from '@services/api.service';
import { LocalSaveService } from '@services/localsave.service';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { SimpleSelectionTool } from 'src/app/models/tools/editing-tools/simple-selection-tool';
import { Tool } from 'src/app/models/tools/tool';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';
import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import { ModalType } from 'src/app/services/modal/modal-type.enum';
import { Color } from 'src/app/utils/color/color';
import { DrawingSurfaceComponent } from '../drawing-surface/drawing-surface.component';
import { EditorParams } from './editor-params';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @ViewChild('drawingSurface', { static: false })
  drawingSurface: DrawingSurfaceComponent;

  @ViewChild('toolbar', { static: false }) toolbar: ToolbarComponent;

  private _currentToolType: ToolType;
  private keyboardListener: EditorKeyboardListener;

  surfaceColor: Color;
  surfaceWidth: number;
  surfaceHeight: number;
  drawingId: string;
  drawing: Drawing;
  modalTypes: typeof ModalType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public editorService: EditorService,
    public dialog: ModalDialogService,
    private apiService: APIService,
  ) {
    this.surfaceColor = DrawingSurfaceComponent.DEFAULT_COLOR;
    this.surfaceWidth = DrawingSurfaceComponent.DEFAULT_WIDTH;
    this.surfaceHeight = DrawingSurfaceComponent.DEFAULT_HEIGHT;
    this.modalTypes = ModalType;
    this.keyboardListener = new EditorKeyboardListener(this);

    this.currentToolType = ToolType.Pen;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.surfaceWidth = params.width ? +params.width : this.surfaceWidth;
      this.surfaceHeight = params.height ? +params.height : this.surfaceHeight;
      this.surfaceColor = params.color ? Color.hex(params.color) : this.surfaceColor;
      this.drawingId = params.id;
    });
  }

  ngAfterViewInit(): void {
    this.editorService.resetDrawing();
    this.editorService.view = this.drawingSurface;
    if (this.drawingId === LocalSaveService.NEW_DRAWING_ID) {
      this.editorService.saveLocally();
      const params: EditorParams = {
        width: this.editorService.view.width.toString(),
        height: this.editorService.view.height.toString(),
        color: this.editorService.view.color.hex,
        id: LocalSaveService.LOCAL_DRAWING_ID,
      };
      this.router.navigate(['edit', params]);
    } else if (this.drawingId === LocalSaveService.LOCAL_DRAWING_ID) {
      this.editorService.importLocalDrawing();
      this.editorService.saveLocally();
    } else if (this.drawingId) {
      this.editorService.importDrawingById(this.drawingId, this.apiService).then(() => {
        this.editorService.saveLocally();
      });
    }
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
    if (!this.dialog.modalIsOpened) {
      this.keyboardListener.handle(event);
    }
  }

  openGuide(): void {
    this.dialog.openByName(ModalType.GUIDE);
  }

  openChooseExportSave(): void {
    const confirmDialog = this.dialog.openByName(ModalType.CHOOSE_EXPORT_SAVE);
    if (confirmDialog) {
      confirmDialog.afterClosed().subscribe((result) => {
        this.dialog.openByName(result);
      });
    }
  }

  openCreateModal(): void {
    const confirmDialog = this.dialog.openByName(ModalType.CONFIRM);
    if (confirmDialog) {
      confirmDialog.afterClosed().subscribe((result) => {
        if (result) {
          this.dialog.openByName(ModalType.CREATE);
        }
      });
    }
  }

  shapeClicked(shape: BaseShape, rightClick: boolean = false): void {
    if (this.currentTool instanceof SimpleSelectionTool) {
      (this.currentTool as SimpleSelectionTool).selectShape(shape, rightClick);
    }
  }

  setToolbarState(opened: boolean): void {
    opened ? this.toolbar.open() : this.toolbar.close();
    this.keyboardListener.listening = !(opened || this.dialog.modalIsOpened);
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

  get loading(): boolean {
    return this.editorService.loading;
  }
}
