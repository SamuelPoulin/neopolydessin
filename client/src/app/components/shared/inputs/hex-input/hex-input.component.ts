import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-hex-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class HexInputComponent extends CustomInputComponent implements OnInit {
  ngOnInit(): void {
    this.stringToMatch = '^[0-9a-fA-F]*$';
    this.format = (v: string): string => (this.maxLength ? v.toLowerCase().padStart(this.maxLength, '0') : v.toLowerCase());
    super.ngOnInit();
  }
}
