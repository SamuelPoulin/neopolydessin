/* tslint:disable:no-string-literal no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import createSpyObj = jasmine.createSpyObj;
import { Drawing } from '@models/drawing';
import { BaseShape } from '@models/shapes/base-shape';
import { Rectangle } from '@models/shapes/rectangle';
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { ColorsService } from './colors.service';
import { EditorService } from './editor.service';
import { Path } from '@models/shapes/path';
import { SocketService } from './socket-service.service';

describe('EditorService', () => {
  let service: EditorService;
  let rectangle: Rectangle;
  let path: Path;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [DrawingSurfaceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    service = new EditorService(new ColorsService(), new SocketService());
    BaseShape['SHAPE_ID'] = 0;
    rectangle = new Rectangle();
    path = new Path();
    const viewSpy = createSpyObj('view', ['addShape', 'removeShape']);
    viewSpy.width = 10;
    viewSpy.height = 10;
    viewSpy.svg = {
      contains: () => false,
    };
    service.view = viewSpy;

    service['shapesBuffer'] = [rectangle, rectangle];
    service.shapes.length = 0;
    service.shapes.push(path);
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
    service.shapes.push(path);
    service.shapes.push(rectangle);
    const result = JSON.parse(service.exportDrawing());
    expect(result.length).toEqual(2);
    expect(result[0].svgNode).toBeFalsy();
    expect(result[0].type).toEqual('Path');
    expect(result[1].type).toEqual('Rectangle');
  });

  it('can import drawing', () => {
    service.shapes.length = 0;
    service.shapes.push(path);
    const api = createSpyObj('api', {
      getDrawingById: () => {
        return;
      },
    });
    api.getDrawingById = async () => {
      return Promise.resolve({ data: service.exportDrawing() } as Drawing);
    };
    const service2 = new EditorService(new ColorsService(), new SocketService());
    service2.importDrawingById('', api);
    expect(service2.shapes.values).toEqual(service.shapes.values);
  });

  it('updates shapes and clears buffer on applyShapeBuffer', () => {
    const clearShapesBufferSpy = spyOn(service, 'clearShapesBuffer');

    service.applyShapesBuffer();

    expect(service['shapesBuffer']).toEqual([]);
    expect(service.shapes).toEqual([path, rectangle, rectangle]);
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
    const shapes = [new Rectangle(), new Rectangle()];
    service.addShapeToBuffer(shapes);
    service.applyShapesBuffer();
    expect(service.shapes).toEqual(shapes);
  });

  it('can remove multiple shapes', () => {
    const removedShapes: BaseShape[] = [];
    const removeShapeSpy = spyOn(service, 'removeShape').and.callFake((shape) => {
      removedShapes.push(shape);
    });
    const shapes = [new Rectangle(), new Rectangle()];
    service.removeShapes(shapes);
    expect(removeShapeSpy).toHaveBeenCalledTimes(2);
    expect(removedShapes).toEqual(shapes);
  });

  it('removes the shapes that were in the buffer from the view on clearShapesBuffer', () => {
    service.addPreviewShape(rectangle);

    service.clearShapesBuffer();

    expect(service.view.removeShape).toHaveBeenCalledTimes(3);
    expect(service.view.removeShape).toHaveBeenCalledWith(rectangle);
    expect(service.view.removeShape).toHaveBeenCalledWith(rectangle);
  });

  it('updates view on addPreviewShape', () => {
    service.addPreviewShape(rectangle);

    expect(service.view.addShape).toHaveBeenCalledWith(rectangle);
    expect(service['previewShapes']).toEqual([rectangle]);
  });

  it('updates view on addShapeToBuffer', () => {
    const path2 = new Path();
    service.view.svg.contains = () => false;

    service.addShapeToBuffer(path2);

    expect(service['shapes']).toEqual([path]);
    expect(service['shapesBuffer']).toEqual([rectangle, rectangle, path2]);
    expect(service.view.addShape).toHaveBeenCalledWith(path2);
  });
  it('adds shape to buffer if view is undefined', () => {
    const ellipse = new Rectangle();
    // @ts-ignore
    service.view = undefined;

    service.addShapeToBuffer(ellipse);
    expect(service['shapesBuffer']).toEqual([rectangle, rectangle, ellipse]);
  });

  it('can remove shape from view', () => {
    service.removeShapeFromView(rectangle);

    expect(service.view.removeShape).toHaveBeenCalledWith(rectangle);
  });

  it('can remove shape', () => {
    service.removeShape(path);
    expect(service.shapes.length).toEqual(0);
    expect(service.view.removeShape).toHaveBeenCalledWith(path);
  });

  it('does not remove shape if it is not in the list', () => {
    service.removeShape(new Rectangle());
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
    const ellipse = new Rectangle();
    BaseShape['SHAPE_ID'] = 5;
    const ellipse1 = new Rectangle();
    ellipse1.svgNode.id = 'ID';
    service['shapes'].push(ellipse1);
    service['shapes'].push(ellipse);

    expect(() => service.findShapeById(5)).toThrow(ShapeError.idCollision());
  });
});
