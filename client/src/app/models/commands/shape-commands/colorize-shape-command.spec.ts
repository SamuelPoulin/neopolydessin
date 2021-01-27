import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '@components/shared/shared.module';
import { Rectangle } from '@models/shapes/rectangle';
import { EditorService } from '@services/editor.service';
import { Color } from '@utils/color/color';
import { ColorizeShapeCommand } from './colorize-shape-command';

describe('ColorizeShapeCommand', () => {
  let fixture: ComponentFixture<EditorComponent>;
  let editor: EditorComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, ToolbarModule],
      declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    editor = fixture.componentInstance;
  });

  it('can colorize primary color', () => {
    const shape = new Rectangle();
    const command = new ColorizeShapeCommand(shape, editor.editorService, Color.RED, true);

    command.execute();

    expect(shape.primaryColor.rgbString).toEqual(Color.RED.rgbString);
  });

  it('can colorize secondary color', () => {
    const shape = new Rectangle();
    const command = new ColorizeShapeCommand(shape, editor.editorService, Color.RED, false);
    command.execute();

    expect(shape.secondaryColor.rgbString).toEqual(Color.RED.rgbString);
  });

  it('can undo colorizing', () => {
    const shape = new Rectangle();
    shape.primaryColor = Color.GREEN;
    const command = new ColorizeShapeCommand(shape, editor.editorService, Color.RED, true);
    command.execute();
    expect(shape.primaryColor.rgbString).toEqual(Color.RED.rgbString);
    command.undo();
    expect(shape.primaryColor.rgbString).toEqual(Color.GREEN.rgbString);
  });
});
