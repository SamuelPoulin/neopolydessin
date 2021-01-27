import { Property, PropertyType } from '@tool-properties/props/property';

export abstract class ToolProperties {// todo: make interface? remove signature?
  [properties: string]: Property<PropertyType>;
}
