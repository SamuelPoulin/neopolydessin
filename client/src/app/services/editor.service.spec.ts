/* tslint:disable:no-string-literal no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import createSpyObj = jasmine.createSpyObj;
import { Drawing } from '@models/drawing';
import { BaseShape } from '@models/shapes/base-shape';
import { Ellipse } from '@models/shapes/ellipse';
import { Line } from '@models/shapes/line';
import { Polygon } from '@models/shapes/polygon';
import { Rectangle } from '@models/shapes/rectangle';
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { SelectionTool } from '@tools/editing-tools/selection-tool/selection-tool';
import { Coordinate } from '@utils/math/coordinate';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { CompositeLine } from 'src/app/models/shapes/composite-line';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { ColorsService } from './colors.service';
import { EditorService } from './editor.service';
import { LocalSaveService } from './localsave.service';

describe('EditorService', () => {
  let service: EditorService;
  let line: Line;
  let rectangle: Rectangle;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [DrawingSurfaceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    service = new EditorService(new ColorsService(), new LocalSaveService());
    BaseShape['SHAPE_ID'] = 0;
    line = new Line();
    rectangle = new Rectangle();
    const viewSpy = createSpyObj('view', ['addShape', 'removeShape']);
    viewSpy.width = 10;
    viewSpy.height = 10;
    viewSpy.svg = {
      contains: () => false,
    };
    service.saveLocally = () => {
      return;
    };
    service.view = viewSpy;

    service['shapesBuffer'] = [rectangle, rectangle];
    // @ts-ignore
    service['shapes'] = [line];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.colorsService).toBeTruthy();
  });

  it('creates new tools at initialisation', () => {
    expect(service.tools.size).not.toEqual(0);
    for (const key of Object.values(ToolType)) {
      const tool = service.tools.get(key);
      expect(tool).toBeDefined();
    }
  });

  it('can export drawing', () => {
    service.shapes.length = 0;
    service.shapes.push(line);
    service.shapes.push(rectangle);
    const result = JSON.parse(service.exportDrawing());
    expect(result.length).toEqual(2);
    expect(result[0].svgNode).toBeFalsy();
    expect(result[0].type).toEqual('Line');
    expect(result[1].type).toEqual('Rectangle');
  });

  it('can import drawing', () => {
    service.shapes.length = 0;
    service.shapes.push(line);
    service.shapes.push(rectangle);
    const api = createSpyObj('api', {
      getDrawingById: () => {
        return;
      },
    });
    api.getDrawingById = async () => {
      return Promise.resolve({ data: service.exportDrawing() } as Drawing);
    };
    const service2 = new EditorService(new ColorsService(), new LocalSaveService());
    service2.importDrawingById('', api);
    expect(service2.shapes.values).toEqual(service.shapes.values);
  });

  it('updates shapes and clears buffer on applyShapeBuffer', () => {
    const clearShapesBufferSpy = spyOn(service, 'clearShapesBuffer');

    service.applyShapesBuffer();

    expect(service['shapesBuffer']).toEqual([]);
    expect(service.shapes).toEqual([line, rectangle, rectangle]);
    expect(clearShapesBufferSpy).toHaveBeenCalledTimes(1);
  });

  it('clears shape buffer', () => {
    service.clearShapesBuffer();
    expect(service['shapesBuffer'].length).toEqual(0);
    expect(service['previewShapes'].length).toEqual(0);
  });

  it('can add multiple shapes', () => {
    service.shapes.length = 0;
    service['shapesBuffer'].length = 0;
    const shapes = [new Rectangle(), new CompositeLine()];
    service.addShapeToBuffer(shapes);
    service.applyShapesBuffer();
    expect(service.shapes).toEqual(shapes);
  });

  it('can remove multiple shapes', () => {
    const removedShapes: BaseShape[] = [];
    const removeShapeSpy = spyOn(service, 'removeShape').and.callFake((shape) => {
      removedShapes.push(shape);
    });
    const shapes = [new Rectangle(), new CompositeLine()];
    service.removeShapes(shapes);
    expect(removeShapeSpy).toHaveBeenCalledTimes(2);
    expect(removedShapes).toEqual(shapes);
  });

  it('removes the shapes that were in the buffer from the view on clearShapesBuffer', () => {
    service.addPreviewShape(line);

    service.clearShapesBuffer();

    expect(service.view.removeShape).toHaveBeenCalledTimes(3);
    expect(service.view.removeShape).toHaveBeenCalledWith(rectangle);
    expect(service.view.removeShape).toHaveBeenCalledWith(line);
  });

  it('updates view on addPreviewShape', () => {
    service.addPreviewShape(line);

    expect(service.view.addShape).toHaveBeenCalledWith(line);
    expect(service['previewShapes']).toEqual([line]);
  });

  it('updates view on addShapeToBuffer', () => {
    const ellipse = new Ellipse();
    service.view.svg.contains = () => false;

    service.addShapeToBuffer(ellipse);

    expect(service['shapes']).toEqual([line]);
    expect(service['shapesBuffer']).toEqual([rectangle, rectangle, ellipse]);
    expect(service.view.addShape).toHaveBeenCalledWith(ellipse);
  });
  it('adds shape to buffer if view is undefined', () => {
    const ellipse = new Ellipse();
    // @ts-ignore
    service.view = undefined;

    service.addShapeToBuffer(ellipse);
    expect(service['shapesBuffer']).toEqual([rectangle, rectangle, ellipse]);
  });

  it('can remove shape from view', () => {
    service.removeShapeFromView(line);

    expect(service.view.removeShape).toHaveBeenCalledWith(line);
  });

  it('can remove shape', () => {
    service.removeShape(line);
    expect(service.shapes.length).toEqual(0);
    expect(service.view.removeShape).toHaveBeenCalledWith(line);
  });

  it('does not remove shape if it is not in the list', () => {
    service.removeShape(new Polygon());
    expect(service.shapes.length).toEqual(1);
    expect(service.view.removeShape).not.toHaveBeenCalled();
  });

  it('can find shape by id', () => {
    BaseShape['SHAPE_ID'] = 5;
    const rect = new Rectangle();
    service['shapes'].push(rect);
    expect(service.findShapeById(5)).toEqual(rect);
    expect(service.findShapeById(10)).not.toBeDefined();
  });

  it('throws an error if findShapeById finds multiple shapes with the same id', () => {
    BaseShape['SHAPE_ID'] = 5;
    const ellipse = new Ellipse();
    BaseShape['SHAPE_ID'] = 5;
    const ellipse1 = new Ellipse();
    ellipse1.svgNode.id = 'ID';
    service['shapes'].push(ellipse1);
    service['shapes'].push(ellipse);

    expect(() => service.findShapeById(5)).toThrow(ShapeError.idCollision());
  });
  it('should increase offset updateShapeOffset call with true', () => {
    const offset = service['pasteOffset'];
    service.updateShapeOffset(true);
    expect(service['pasteOffset']).toBeGreaterThan(offset);
  });
  it('should decrease offset updateShapeOffset call with false', () => {
    const offset = service['pasteOffset'];
    service.updateShapeOffset(false);
    expect(service['pasteOffset']).toBeLessThan(offset);
  });

  // BEGIN TEST CLIPBOARD
  it('should copy items into clipboard', () => {
    service.selection.shapes.push(...service.shapes);
    service.copySelectedShapes();
    expect(service.clipboard[0]).toBeDefined();
  });
  it("copied items shouldn't have identical id's", () => {
    service.selection.shapes.push(...service.shapes);
    service.copySelectedShapes();
    expect(service.clipboard[0].id).not.toEqual(line.id);
  });
  it('should keep copies into clipboard after removal', () => {
    service['selectionTool']['resetSelection']();
    service.selection.addSelectedShape(line);
    service.copySelectedShapes();
    service.removeShape(service.shapes[0]);
    expect(service.clipboard.length).toBeGreaterThan(0);
  });
  it('should replace clipboard with new element on copy', () => {
    const shape = new Rectangle(new Coordinate(1, 1), 2, 2);
    const newShape = new Ellipse(new Coordinate(1, 1), 2, 2);
    service.selection.addSelectedShape(shape);
    service.copySelectedShapes();
    service.selection.clear();
    service.selection.addSelectedShape(newShape);
    service.copySelectedShapes();
    expect(service.clipboard[0].id).not.toEqual(shape.id);
  });
  it('should add selectedShapes into clipboard on cut', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(...service.shapes);
    service.cutSelectedShapes();
    expect(service.clipboard[0]).toEqual(line);
  });
  it('should remove shape from drawingSurface on cut', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(...service.shapes);
    service.cutSelectedShapes();
    expect(service.shapes.length).toEqual(0);
  });
  it('should replace clipboard with new element on cut', () => {
    const shape = new Rectangle(new Coordinate(1, 1), 2, 2);
    const newShape = new Ellipse(new Coordinate(1, 1), 2, 2);
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(shape);
    service.cutSelectedShapes();
    service.selection.clear();
    service.selection.shapes.push(newShape);
    service.cutSelectedShapes();
    expect(service.clipboard[0].id).toEqual(newShape.id);
  });
  it('should add clipboard shapes onto view on paste', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(...service.shapes);
    service.copySelectedShapes();
    service.pasteClipboard();
    expect(service.shapes.length).toEqual(2);
  });
  it('should offset copied shapes on paste', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(...service.shapes);
    service.copySelectedShapes();
    service.pasteClipboard();
    expect(service.shapes[1].origin).toEqual(
      Coordinate.add(line.origin, new Coordinate(SelectionTool.PASTED_OFFSET, SelectionTool.PASTED_OFFSET)),
    );
  });
  it('should offset cut shapes on paste', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(...service.shapes);
    service.cutSelectedShapes();
    service.pasteClipboard();
    expect(service.shapes[0].origin).toEqual(
      Coordinate.add(line.origin, new Coordinate(SelectionTool.PASTED_OFFSET, SelectionTool.PASTED_OFFSET)),
    );
  });
  it('should offset shapes on duplication', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(...service.shapes);
    service.duplicateSelectedShapes();
    expect(service.shapes[1].origin).toEqual(
      Coordinate.add(line.origin, new Coordinate(SelectionTool.PASTED_OFFSET, SelectionTool.PASTED_OFFSET)),
    );
  });
  it('should not modify clipboard on duplication', () => {
    service['selectionTool']['resetSelection']();
    const shape = new Rectangle(new Coordinate(1, 1), 2, 2);
    service.shapes.push(shape);
    service.selection.shapes.push(service.shapes[0]);
    service.copySelectedShapes();
    const buffer = service.clipboard[0].id;
    service.selection.clear();
    service.selection.shapes.push(service.shapes[1]);
    service.duplicateSelectedShapes();
    expect(service.clipboard[0].id).toEqual(buffer);
  });
  it('should paste at first location when out of view', () => {
    service['selectionTool']['resetSelection']();
    const shape = new Rectangle(new Coordinate(9, 9), 2, 2);
    service.shapes.push(shape);
    service.selection.shapes.push(service.shapes[1]);
    service.copySelectedShapes();
    service.pasteClipboard();
    expect(service.shapes[2].origin).toEqual(service.clipboard[0].origin);
  });
  it('should delete selected shapes', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(service.shapes[0]);
    service.deleteSelectedShapes();
    expect(service.shapes.length).toEqual(0);
  });
  it('should delete selected shapes', () => {
    service['selectionTool']['resetSelection']();
    service.selection.shapes.push(service.shapes[0]);
    service.deleteSelectedShapes();
    expect(service.shapes.length).toEqual(0);
  });
  it('should selectAll on call', () => {
    const selectAllSpy = spyOn(service['selectionTool'], 'selectAll');
    service.selectAll();
    expect(selectAllSpy).toHaveBeenCalled();
  });
});
