import { Component } from '@angular/core';
import randomColor from 'randomcolor';
@Component({
  selector: 'app-account-navbar',
  templateUrl: './account-navbar.component.html',
  styleUrls: ['./account-navbar.component.scss']
})
export class AccountNavbarComponent {
  avatarColor: string;
  avatarLetter: string;

  constructor() {
    this.avatarLetter = 'S';
    this.avatarColor = randomColor({seed: this.avatarLetter, luminosity: 'bright'});
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
