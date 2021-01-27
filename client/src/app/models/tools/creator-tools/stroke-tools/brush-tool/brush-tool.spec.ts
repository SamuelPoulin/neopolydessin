/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { BrushPath } from '@models/shapes/brush-path';
import { BrushTextureType } from '@tool-properties/creator-tool-properties/brush-texture-type.enum';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { BrushTool } from 'src/app/models/tools/creator-tools/stroke-tools/brush-tool/brush-tool';
import { EditorService } from 'src/app/services/editor.service';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { mouseDown } from '../stroke-tool.spec';

describe('BrushTool', () => {
  let fixture: ComponentFixture<EditorComponent>;
  let brushTool: BrushTool;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorComponent, DrawingSurfaceComponent, GridComponent],
      imports: [SharedModule, RouterTestingModule, ToolbarModule],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    brushTool = new BrushTool(fixture.componentInstance.editorService);
  });

  it('Should not add shape on mousedown event if already active', () => {
    const addShapeSpy = spyOn(brushTool, 'addShape');
    brushTool['isActive'] = true;
    brushTool.shape = brushTool.createShape();
    brushTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    expect(addShapeSpy).not.toHaveBeenCalled();
  });

  it('should add shape on mousedown when not already active', () => {
    const addShapeSpy = spyOn(brushTool, 'addShape');
    brushTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    expect(addShapeSpy).toHaveBeenCalled();
  });

  it('should set old filter on createShape', () => {
    brushTool.shape = new BrushPath();
    brushTool.shape.filter = BrushTextureType.TEXTURE_2;
    const newShape = brushTool.createShape();
    expect(newShape.filter).toEqual(BrushTextureType.TEXTURE_2);
  });
});
