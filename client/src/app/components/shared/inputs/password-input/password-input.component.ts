import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-password-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class PasswordInputComponent extends CustomInputComponent implements OnInit {
  ngOnInit(): void {
    this.isPassword = true;
    this.format = (v: string): string => v;
    super.ngOnInit();
  }
}
