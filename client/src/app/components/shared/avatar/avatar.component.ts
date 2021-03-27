import { Component, Input, OnInit } from '@angular/core';
import randomColor from 'randomcolor';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  @Input() username: string;
  @Input() src: string;
  @Input() size: number;
  @Input() fontSize: number;

  letter: string;
  color: string;

  constructor() {
    this.username = '';
    this.src = '';
    this.letter = '';
    this.color = '';
    this.size = 50;
    this.fontSize = 25;
  }

  ngOnInit() {
    this.letter = this.src ? '' : this.username ? this.username[0].toUpperCase() : '';
    this.color = randomColor({ seed: this.username, luminosity: 'bright' });
  }
}
