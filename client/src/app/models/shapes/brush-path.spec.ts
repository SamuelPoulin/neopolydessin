import { EditorUtils } from '@utils/color/editor-utils';
import { BrushPath } from 'src/app/models/shapes/brush-path';
import { BrushTextureType } from 'src/app/models/tool-properties/creator-tool-properties/brush-texture-type.enum';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { BaseShape } from './base-shape';

describe('Path', () => {
  let brush: BrushPath;
  beforeEach(() => {
    brush = new BrushPath(new Coordinate());
  });
  it('Can change filter', () => {
    brush.filter = BrushTextureType.TEXTURE_1;
    expect(brush.svgNode.getAttribute('filter')).toEqual('url(#TEXTURE_1)');
    brush.filter = BrushTextureType.TEXTURE_2;
    expect(brush.svgNode.getAttribute('filter')).toEqual('url(#TEXTURE_2)');
    brush.filter = BrushTextureType.TEXTURE_3;
    expect(brush.svgNode.getAttribute('filter')).toEqual('url(#TEXTURE_3)');
    brush.filter = BrushTextureType.TEXTURE_4;
    expect(brush.svgNode.getAttribute('filter')).toEqual('url(#TEXTURE_4)');
    brush.filter = BrushTextureType.TEXTURE_5;
    expect(brush.svgNode.getAttribute('filter')).toEqual('url(#TEXTURE_5)');
  });
  it('Can get filter', () => {
    const filter = BrushTextureType.TEXTURE_2;
    brush.filter = filter;
    expect(brush.filter).toEqual(filter);
  });
  it('Can read shape', () => {
    brush.filter = BrushTextureType.TEXTURE_3;
    const brush2 = EditorUtils.createShape(JSON.parse(JSON.stringify(brush, BaseShape.jsonReplacer)));
    expect(Object.values(brush2)).toEqual(Object.values(brush));
  });
});
