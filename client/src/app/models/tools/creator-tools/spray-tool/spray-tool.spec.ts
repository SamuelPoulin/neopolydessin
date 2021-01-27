/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '@components/shared/shared.module';
import { ColorsService } from '@services/colors.service';
import { EditorService } from '@services/editor.service';
import { SprayToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/spray-tool-properties';
import { mouseDown, mouseLeave, mouseUp } from '../stroke-tools/stroke-tool.spec';
import { SprayTool } from './spray-tool';

describe('SprayTool', () => {
  let sprayTool: SprayTool;
  let fixture: ComponentFixture<EditorComponent>;
  let properties: SprayToolProperties;
  // @ts-ignore
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
    properties = new SprayToolProperties();
    sprayTool = new SprayTool(fixture.componentInstance.editorService);
    sprayTool.toolProperties = properties;
    selectedColorsService = new ColorsService();
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should call startShape onmousedown if not active', () => {
    const startShapeSpy = spyOn(sprayTool, 'startShape');
    sprayTool['isActive'] = false;
    sprayTool.handleMouseDown(mouseDown());
    expect(startShapeSpy).toHaveBeenCalled();
  });

  it('should addParticle after interval if active', () => {
    sprayTool.handleMouseDown(mouseDown());
    jasmine.clock().tick(SprayTool.INTERVAL_REFRESH_VALUE + 1);
    expect(sprayTool.shape['particles'].length).toEqual(2);
    sprayTool.applyShape();
  });

  it('should have undefined shape if not active', () => {
    sprayTool['isActive'] = false;
    expect(sprayTool.shape).toBeUndefined();
  });

  it('should call applyShape onmouseup if active', () => {
    const applyShapeSpy = spyOn(sprayTool, 'applyShape');
    sprayTool['isActive'] = true;
    sprayTool.handleMouseUp(mouseUp());
    expect(applyShapeSpy).toHaveBeenCalled();
  });

  it('should call applyShape onmouseleave if active', () => {
    const applyShapeSpy = spyOn(sprayTool, 'applyShape');
    sprayTool['isActive'] = true;
    sprayTool.handleMouseLeave(mouseLeave());
    expect(applyShapeSpy).toHaveBeenCalled();
  });

  it('should not startShape if active', () => {
    const startShapeSpy = spyOn(sprayTool, 'startShape');
    sprayTool['isActive'] = true;
    sprayTool.handleMouseDown(mouseDown());
    expect(startShapeSpy).not.toHaveBeenCalled();
  });

  it('should not applyShape if not active', () => {
    const applyShapeSpy = spyOn(sprayTool, 'applyShape');
    sprayTool['isActive'] = false;
    sprayTool.handleMouseUp(mouseUp());
    expect(applyShapeSpy).not.toHaveBeenCalled();
  });
});
