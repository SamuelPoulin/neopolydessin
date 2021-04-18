import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-account-section',
  templateUrl: './account-section.component.html',
  styleUrls: ['./account-section.component.scss'],
})
export class AccountSectionComponent {
  @Input() title: string;

  constructor() {
    this.title = '';
  }
}
