/* tslint:disable:no-string-literal */
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { LocalSaveService } from '@services/localsave.service';
import { Property } from '@tool-properties/props/property';
import { ToolProperties } from '@tool-properties/tool-properties';
import { Tool } from '@tools/tool';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { ColorsService } from 'src/app/services/colors.service';
import { EditorService } from 'src/app/services/editor.service';

export class AbstractToolbarEntryMock extends AbstractToolbarEntry<CreatorToolProperties> {
  constructor(editorService: EditorService) {
    super(editorService, 'MockType' as ToolType);
  }
}

describe('AbstractToolbarEntry', () => {
  let toolbarEntry: AbstractToolbarEntry<ToolProperties>;
  let editorService: EditorService;
  const type: ToolType = 'MockType' as ToolType;
  const toolProperties = {
    prop: { value: 'VALUE' } as Property<string>,
  } as ToolProperties;

  beforeEach(() => {
    editorService = new EditorService(new ColorsService(), new LocalSaveService());
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
