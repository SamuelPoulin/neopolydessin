import { Input } from '@angular/core';
import { Property, PropertyType } from '@tool-properties/props/property';

export abstract class AbstractPropertyInput<T extends Property<PropertyType>> {
  @Input() property: Property<PropertyType>;
}
