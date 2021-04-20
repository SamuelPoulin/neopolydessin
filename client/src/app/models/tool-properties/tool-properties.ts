import { Property, PropertyType } from '@tool-properties/props/property';

export abstract class ToolProperties {
  [properties: string]: Property<PropertyType>;
}
