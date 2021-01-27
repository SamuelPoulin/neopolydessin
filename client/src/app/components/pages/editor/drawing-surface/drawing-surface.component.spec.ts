/*tslint:disable:no-string-literal no-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { Rectangle } from 'src/app/models/shapes/rectangle';

import { DrawingSurfaceComponent } from './drawing-surface.component';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('DrawingSurfaceComponent', () => {
  let component: DrawingSurfaceComponent;
  let fixture: ComponentFixture<DrawingSurfaceComponent>;
  let nativeElementSpyObj: SpyObj<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [DrawingSurfaceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingSurfaceComponent);
    component = fixture.componentInstance;
    nativeElementSpyObj = createSpyObj('nativeElement', ['removeChild', 'appendChild']);
    fixture.detectChanges();
    component['_svg'].nativeElement = nativeElementSpyObj;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can remove shape from the view', () => {
    component.svg.contains = ()=>true;
    const shape = new Rectangle();
    component.removeShape(shape);
    expect(nativeElementSpyObj.removeChild).toHaveBeenCalledWith(shape.svgNode);
  });

  it('does not remove shape if view does not contain the shape', () => {
    component.svg.contains = ()=>false;
    const shape = new Rectangle();
    component.removeShape(shape);
    expect(nativeElementSpyObj.removeChild).not.toHaveBeenCalled();
  });

  it('can add shape to the view', () => {
    const shape = new Rectangle();

    component.addShape(shape);
    expect(nativeElementSpyObj.appendChild).toHaveBeenCalledWith(shape.svgNode);
  });

  it('can add onclick event listener on added shapes', () => {
    const shape = new Rectangle();
    component.addShape(shape);

    expect(shape.svgNode.onclick).toBeDefined();
  });

  it('emits shapeClicked when clicking a shape', () => {
    const shape = new Rectangle();
    const shapeClickedSpy = spyOn(component['shapeClicked'], 'emit');
    component.addShape(shape);
    // @ts-ignore
    shape.svgNode.onclick();
    expect(shapeClickedSpy).toHaveBeenCalled();
  });

  it('emits shapeRightClicked when right clicking clicking a shape', () => {
    const shape = new Rectangle();
    const shapeRightClickedSpy = spyOn(component['shapeRightClicked'], 'emit');
    component.addShape(shape);
    // @ts-ignore
    shape.svgNode.oncontextmenu();
    expect(shapeRightClickedSpy).toHaveBeenCalled();
  });
});
