import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-email-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class EmailInputComponent extends CustomInputComponent implements OnInit {
  static readonly EMAIL_REGEX: string = '(.+)@(.+){2,}.(.+){2,}';
  static readonly INVALID_EMAIL_MSG: string = 'Doit avoir le format example@domain.com';

  ngOnInit(): void {
    this.stringToMatch = EmailInputComponent.EMAIL_REGEX;
    this.format = (v: string): string => v;
    this.errorMessages.pattern = EmailInputComponent.INVALID_EMAIL_MSG;
    super.ngOnInit();
  }
}
