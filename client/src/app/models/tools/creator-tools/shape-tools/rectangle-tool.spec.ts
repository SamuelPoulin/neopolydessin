/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { ShapeToolProperties } from '@tool-properties/creator-tool-properties/shape-tool-properties/shape-tool-properties';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ContourType } from 'src/app/models/tool-properties/creator-tool-properties/contour-type.enum';
import { RectangleTool } from 'src/app/models/tools/creator-tools/shape-tools/rectangle-tool';
import { mouseDown } from 'src/app/models/tools/creator-tools/stroke-tools/stroke-tool.spec';
import { ColorsService } from 'src/app/services/colors.service';
import { EditorService } from 'src/app/services/editor.service';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('RectangleTool', () => {
  let rectangleTool: RectangleTool;
  let fixture: ComponentFixture<EditorComponent>;
  let properties: ShapeToolProperties;
  let selectedColorsService: ColorsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorComponent, DrawingSurfaceComponent, GridComponent],
      imports: [SharedModule, RouterTestingModule, ToolbarModule],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    selectedColorsService = new ColorsService();
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    properties = new ShapeToolProperties();
    rectangleTool = new RectangleTool(fixture.componentInstance.editorService);
  });

  it('can initialize new Rectangle', () => {
    rectangleTool.toolProperties = properties;
    rectangleTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    expect(rectangleTool.shape.origin).toEqual(new Coordinate(100, 100));
    expect(fixture.componentInstance.drawingSurface.svg.querySelector('rect')).toBeTruthy();
  });

  it('can resize Rectangle', () => {
    rectangleTool.toolProperties = properties;
    rectangleTool['_mousePosition'] = new Coordinate(100, 100);
    rectangleTool['shape'] = rectangleTool.createShape();
    rectangleTool.resizeShape(new Coordinate(75, 50));
    expect(rectangleTool.shape.width).toEqual(75);
    expect(rectangleTool.shape.height).toEqual(50);
  });

  it('can resize and reposition Rectangle', () => {
    rectangleTool.toolProperties = properties;
    rectangleTool['_mousePosition'] = new Coordinate(100, 100);
    rectangleTool['shape'] = rectangleTool.createShape();
    rectangleTool.resizeShape(new Coordinate(75, 50), new Coordinate(125, 125));
    expect(rectangleTool.shape.origin).toEqual(new Coordinate(125, 125));
    expect(rectangleTool.shape.width).toEqual(75);
    expect(rectangleTool.shape.height).toEqual(50);
  });

  it('can draw Rectangle contour and fill', () => {
    properties.contourType.value = ContourType.FILLED_CONTOUR;
    rectangleTool.toolProperties = properties;
    rectangleTool['_mousePosition'] = new Coordinate(50, 100);
    rectangleTool['shape'] = rectangleTool.createShape();
    const style = rectangleTool.shape.svgNode.style;
    expect(style.fill).toEqual(selectedColorsService.primaryColor.rgbString);
    expect(style.stroke).toEqual(selectedColorsService.secondaryColor.rgbString);
  });

  it('can draw Rectangle fill only', () => {
    properties.contourType.value = ContourType.FILLED;
    rectangleTool.toolProperties = properties;
    rectangleTool['_mousePosition'] = new Coordinate(100, 100);
    rectangleTool['shape'] = rectangleTool.createShape();
    rectangleTool['updateProperties']();
    const style = rectangleTool.shape.svgNode.style;
    expect(style.fill).toEqual(selectedColorsService.primaryColor.rgbString);
    expect(style.stroke).toEqual('none');
  });

  it('can draw Rectangle contour only', () => {
    properties.contourType.value = ContourType.CONTOUR;
    rectangleTool.toolProperties = properties;
    rectangleTool['_mousePosition'] = new Coordinate(100, 100);
    rectangleTool['shape'] = rectangleTool.createShape();
    rectangleTool['updateProperties']();
    const style = rectangleTool.shape.svgNode.style;
    expect(style.fill).toEqual('none');
    expect(style.stroke).toEqual(selectedColorsService.secondaryColor.rgbString);
  });
});
