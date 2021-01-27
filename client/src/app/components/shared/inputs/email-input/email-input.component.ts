import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-email-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class EmailInputComponent extends CustomInputComponent implements OnInit {
  static readonly EMAIL_REGEX: string = '^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@((\\bpolymtl.ca)|(\\bgmail.com))$';
  static readonly INVALID_EMAIL_MSG: string = 'Doit être un email valide du domaine polymtl.ca ou gmail.com';

  ngOnInit(): void {
    this.stringToMatch = EmailInputComponent.EMAIL_REGEX;
    this.format = (v: string): string => v;
    this.hintLabel = 'Lettres, espaces et nombres. Maximum 20 charactères';
    this.errorMessages.pattern = EmailInputComponent.INVALID_EMAIL_MSG;
    super.ngOnInit();
  }
}
