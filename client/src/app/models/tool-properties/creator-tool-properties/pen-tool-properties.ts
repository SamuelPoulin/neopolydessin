import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';

export class PenToolProperties extends CreatorToolProperties {
  static readonly MIN_THICKNESS: number = 1;
  static readonly MAX_THICKNESS: number = 50;

  constructor() {
    super(PenToolProperties.MIN_THICKNESS, PenToolProperties.MAX_THICKNESS);
  }
}
