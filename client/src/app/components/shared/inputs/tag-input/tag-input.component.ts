import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-tag-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class TagInputComponent extends CustomInputComponent implements OnInit {
  ngOnInit(): void {
    this.stringToMatch = '^[0-9a-zA-Z]{3,20}$';
    this.format = (v: string): string => v;
    this.hintLabel = 'Lettres et nombres. Maximum 20 charactères, minimum 3';
    super.ngOnInit();
  }
}
