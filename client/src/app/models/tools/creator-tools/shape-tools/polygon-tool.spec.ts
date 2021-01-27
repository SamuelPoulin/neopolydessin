/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { keyUp } from '@components/pages/editor/editor/editor.component.spec';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { PolygonToolProperties } from '@tool-properties/creator-tool-properties/shape-tool-properties/polygon-tool-properties';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ContourType } from 'src/app/models/tool-properties/creator-tool-properties/contour-type.enum';
import { PolygonTool } from 'src/app/models/tools/creator-tools/shape-tools/polygon-tool';
import { mouseDown } from 'src/app/models/tools/creator-tools/stroke-tools/stroke-tool.spec';
import { ColorsService } from 'src/app/services/colors.service';
import { EditorService } from 'src/app/services/editor.service';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('PolygonTool', () => {
  let polygonTool: PolygonTool;
  let fixture: ComponentFixture<EditorComponent>;
  let properties: PolygonToolProperties;
  let selectedColorsService: ColorsService;

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
    properties = new PolygonToolProperties();
    polygonTool = new PolygonTool(fixture.componentInstance.editorService);
    polygonTool.toolProperties = properties;
    selectedColorsService = new ColorsService();
  });

  it('can initialize new Polygon', () => {
    polygonTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    expect(polygonTool.shape.origin).toEqual(new Coordinate(100, 100));
    expect(fixture.componentInstance.drawingSurface.svg.querySelector('polygon')).toBeTruthy();
  });

  it('should initialize new Polygon with equal dimensions', () => {
    expect(polygonTool['forceEqualDimensions']).toEqual(true);
  });

  it('should force equal size to true after shift up input', () => {
    polygonTool.setEqualDimensions(false);
    polygonTool.handleKeyboardEvent(keyUp('Shift', false));
    expect(polygonTool['forceEqualDimensions']).toEqual(true);
  });

  it('can draw Polygon contour and fill', () => {
    polygonTool['_mousePosition'] = new Coordinate(50, 100);
    properties.contourType.value = ContourType.FILLED_CONTOUR;
    polygonTool['shape'] = polygonTool.createShape();
    const style = polygonTool.shape.svgNode.style;
    expect(style.fill).toEqual(selectedColorsService.primaryColor.rgbString);
    expect(style.stroke).toEqual(selectedColorsService.secondaryColor.rgbString);
  });

  it('can draw Polygon fill only', () => {
    polygonTool['_mousePosition'] = new Coordinate(100, 100);
    properties.contourType.value = ContourType.FILLED;
    polygonTool['shape'] = polygonTool.createShape();
    polygonTool['updateProperties']();
    const style = polygonTool.shape.svgNode.style;
    expect(style.fill).toEqual(selectedColorsService.primaryColor.rgbString);
    expect(style.stroke).toEqual('none');
  });

  it('can draw Polygon contour only', () => {
    polygonTool['_mousePosition'] = new Coordinate(100, 100);
    properties.contourType.value = ContourType.CONTOUR;
    polygonTool['shape'] = polygonTool.createShape();
    polygonTool['updateProperties']();
    const style = polygonTool.shape.svgNode.style;
    expect(style.fill).toEqual('none');
    expect(style.stroke).toEqual(selectedColorsService.secondaryColor.rgbString);
  });
});
