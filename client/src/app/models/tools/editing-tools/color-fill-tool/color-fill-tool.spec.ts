/* tslint:disable:no-magic-numbers no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';
import { click } from '@tools/creator-tools/stroke-tools/stroke-tool.spec';
import { ColorFillTool } from '@tools/editing-tools/color-fill-tool/color-fill-tool';
import { ColorFillUtils } from '@tools/editing-tools/color-fill-tool/color-fill-utils';
import { Color } from '@utils/color/color';
import { EditorUtils } from '@utils/color/editor-utils';
import { Coordinate } from '@utils/math/coordinate';
import createSpyObj = jasmine.createSpyObj;

describe('ColorFillTool', () => {
  let tool: ColorFillTool;
  let ctx: jasmine.SpyObj<CanvasRenderingContext2D>;
  let colorData: Uint8ClampedArray;
  let fixture: ComponentFixture<EditorComponent>;
  let colorFillUtils: jasmine.SpyObj<ColorFillUtils>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorComponent, DrawingSurfaceComponent, GridComponent],
      imports: [SharedModule, RouterTestingModule, ToolbarModule],
      providers: [EditorService],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    tool = new ColorFillTool(fixture.componentInstance.editorService);
  }));

  beforeEach(() => {
    colorFillUtils = createSpyObj<ColorFillUtils>('colorFillUtils', ['floodFill', 'getColor', 'setColor']);
    tool['colorFillUtils'] = colorFillUtils;

    ctx = createSpyObj<CanvasRenderingContext2D>('canvas', ['getImageData']);
    colorData = {} as Uint8ClampedArray;

    ctx.getImageData.and.returnValue({ data: colorData } as ImageData);

    tool['editorService'].view = {
      width: 100,
      height: 100,
    } as DrawingSurfaceComponent;
  });

  it('should create an instance', () => {
    expect(tool).toBeTruthy();
  });

  it('can floodfill on mouse click', (done) => {
    spyOn(EditorUtils, 'viewToCanvas').and.returnValue(
      new Promise<CanvasRenderingContext2D>((resolve) => {
        resolve(ctx);
        done();
      }),
    );

    const floodFillSpy = spyOn(tool, 'floodFill');
    const applyShapeSpy = spyOn(tool, 'applyShape');
    tool.handleClick(click());

    fixture.whenStable().then(() => {
      expect(floodFillSpy).toHaveBeenCalled();
      expect(applyShapeSpy).toHaveBeenCalled();
    });
  });

  it('calls ColorFillUtils::floodFill on floodFill', () => {
    const coord = new Coordinate(5, 10);
    spyOn(EditorUtils, 'colorAtPointFromUint8ClampedArray').and.returnValue(Color.RED);
    tool['editorService'].colorsService.primaryColor = Color.GREEN;

    tool['_mousePosition'] = coord;
    tool['colorData'] = ctx.getImageData().data;

    tool.floodFill();

    expect(colorFillUtils.floodFill).toHaveBeenCalledWith(coord, Color.RED, Color.GREEN, 0);
    expect(EditorUtils.colorAtPointFromUint8ClampedArray).toHaveBeenCalledWith(colorData, coord, 100);
  });

  it('sets setColor method correctly', () => {
    const coord = new Coordinate(5, 10);
    spyOn(EditorUtils, 'colorAtPointFromUint8ClampedArray').and.returnValue(Color.RED);
    tool['editorService'].colorsService.primaryColor = Color.GREEN;

    tool.floodFill();
    const setColorFunc = tool['colorFillUtils'].setColor;
    setColorFunc(coord, Color.RED);

    expect(tool['minPoint']).toEqual(coord);
    expect(tool['maxPoint']).toEqual(coord);
    expect(tool['pointsToColorize'].get(coord.toString())).toBeDefined();
  });

  it('applyShape adds a new command', () => {
    const addCommandSpy = spyOn(tool['editorService'].commandReceiver, 'add');

    tool.applyShape();

    expect(addCommandSpy).toHaveBeenCalled();
  });
});
