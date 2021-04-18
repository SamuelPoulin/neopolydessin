/* tslint:disable:no-string-literal */
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { Property } from '@tool-properties/props/property';
import { ToolProperties } from '@tool-properties/tool-properties';
import { Tool } from '@tools/tool';
import { AbstractToolbarEntryDirective } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';
import { Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockEditorService } from '@services/editor.service.spec';

@Directive()
export class AbstractToolbarEntryMock extends AbstractToolbarEntryDirective<CreatorToolProperties> {
  constructor(editorService: EditorService) {
    super(editorService, 'MockType' as ToolType);
  }
}

describe('AbstractToolbarEntry', () => {
  let toolbarEntry: AbstractToolbarEntryDirective<ToolProperties>;
  let editorService: EditorService;
  const type: ToolType = 'MockType' as ToolType;
  const toolProperties = {
    prop: { value: 'VALUE' } as Property<string>,
  } as ToolProperties;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    });
    editorService = TestBed.inject(EditorService);
    editorService.tools.set(type, { toolProperties } as Tool);
    toolbarEntry = new AbstractToolbarEntryMock(editorService);
  });

  it('can get tool properties', () => {
    const { toolProperties: props } = toolbarEntry;
    expect(props).toEqual(toolProperties);
    expect(props['prop'].value).toEqual('VALUE');
  });

  it('throws error if tool does not exist', () => {
    const invalidType = 'invalid_type' as ToolType;
    toolbarEntry['type'] = invalidType;
    expect(() => toolbarEntry.toolProperties).toThrow(ShapeError.typeNotFound(invalidType));
  });
});
