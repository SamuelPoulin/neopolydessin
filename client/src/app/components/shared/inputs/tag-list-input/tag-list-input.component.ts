import { Component, OnInit } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-tag-list-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class TagListInputComponent extends CustomInputComponent implements OnInit {
  ngOnInit(): void {
    this.stringToMatch = '^([ ]*[0-9a-zA-Z]{1,20}[ ]*[,])*([ ]*[0-9a-zA-Z]{1,20}[ ]*)+$';
    this.format = (v: string): string => v;
    this.hintLabel = 'Lettres et nombres, maximum 20 charactères par tag séparés par virgules';
    super.ngOnInit();
  }
}
