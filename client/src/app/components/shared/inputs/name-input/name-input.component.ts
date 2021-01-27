import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-name-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class NameInputComponent extends CustomInputComponent implements OnInit {
  ngOnInit(): void {
    this.stringToMatch = '^[A-Za-z0-9. ]+(?:[_&%$*#@!-][A-Za-z0-9. ]+)*$';
    this.format = (v: string): string => v;
    this.hintLabel = 'Lettres, espaces et nombres. Maximum 20 charactères';
    super.ngOnInit();
  }
}
