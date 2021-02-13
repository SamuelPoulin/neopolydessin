import { Input, Directive } from '@angular/core';
import { Property, PropertyType } from '@tool-properties/props/property';

@Directive()
export abstract class AbstractPropertyInputDirective<T extends Property<PropertyType>> {
  @Input() property: Property<PropertyType>;
}
