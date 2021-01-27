import { EnumProperty } from './enum-property';

describe('EnumProperty', () => {
  enum Enum {
    a = '1',
    b = '2',
  }
  let enumProperty: EnumProperty<Enum, Enum>;

  beforeEach(() => {
    const value: Enum = Enum.a;
    enumProperty = new EnumProperty(value, Enum);
  });

  it('should create an instance', () => {
    expect(enumProperty).toBeDefined();
    expect(enumProperty.value).toEqual(Enum.a);
  });

  it('can get choices', () => {
    const choices = enumProperty.choices;
    expect(choices).toEqual(['1', '2']);
  });
});
