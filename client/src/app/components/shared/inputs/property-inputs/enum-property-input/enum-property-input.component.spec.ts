/* tslint:disable:no-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material';
import { EnumProperty } from '@tool-properties/props/enum-property/enum-property';
import { EnumPropertyInputComponent } from './enum-property-input.component';

describe('EnumPropertyInputComponent', () => {
  enum Enum {
    a = 1, b = 2,
  }

  let component: EnumPropertyInputComponent<any, any>;
  let fixture: ComponentFixture<EnumPropertyInputComponent<any, any>>;

  let enumProp: EnumProperty<Enum, Enum>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatRadioModule, FormsModule],
      declarations: [ EnumPropertyInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnumPropertyInputComponent);
    component = fixture.componentInstance;
    enumProp = new EnumProperty(Enum.b, Enum);
    component.property = enumProp;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(enumProp.value).toEqual(Enum.b);
  });
});
