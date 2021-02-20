import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-username-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class UsernameInputComponent extends CustomInputComponent implements OnInit {
  static readonly INVALID_USERNAME_MSG: string = 'Doit contenir seulement 10 lettres ou chiffres.';

  ngOnInit(): void {
    this.stringToMatch = '^[A-Za-z0-9. ]+(?:[_&%$*#@!-][A-Za-z0-9. ]+)*$';
    this.format = (v: string): string => v;
    this.errorMessages.pattern = UsernameInputComponent.INVALID_USERNAME_MSG;
    super.ngOnInit();
  }
}
