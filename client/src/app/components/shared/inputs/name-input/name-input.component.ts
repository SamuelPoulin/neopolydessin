import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-name-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class NameInputComponent extends CustomInputComponent implements OnInit {
  static readonly INVALID_NAME_MSG: string = 'Doit contenir seulement des lettres.';

  ngOnInit(): void {
    this.stringToMatch = '^[A-Za-z]+$';
    this.format = (v: string): string => v;
    this.errorMessages.pattern = NameInputComponent.INVALID_NAME_MSG;
    super.ngOnInit();
  }
}
