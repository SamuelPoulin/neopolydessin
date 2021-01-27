import { Property, PropertyType } from '@tool-properties/props/property';

export class EnumProperty<E extends PropertyType,ENUM> implements Property<E> {
  value: E;
  readonly choices: string[];

  constructor(value: E, choices: ENUM) {
    this.value = value;
    this.choices = Object.values(choices);
  }
}
