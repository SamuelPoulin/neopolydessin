import { Component, Input, OnInit } from '@angular/core';
import { APIService } from '@services/api.service';
import { UserService } from '@services/user.service';
import randomColor from 'randomcolor';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  @Input() username: string;
  @Input() avatarId: string;
  @Input() mainUser: boolean;
  @Input() size: number;
  @Input() fontSize: number;

  color: string;
  url: string;

  constructor(private apiService: APIService, private userService: UserService) {
    this.color = '';
    this.size = 50;
    this.fontSize = 25;
  }

  ngOnInit() {
    this.color = randomColor({ seed: this.username, luminosity: 'bright' });

    if (this.mainUser !== undefined) {
      if (this.userService.avatarBlob) {
        this.url = URL.createObjectURL(this.userService.avatarBlob);
      } else {
        this.userService.fetchAvatar().then(() => {
          this.url = URL.createObjectURL(this.userService.avatarBlob);
        });
      }
    }
    if (this.avatarId) {
      this.apiService.getAvatarById(this.avatarId).then((blob: any) => {
        this.url = URL.createObjectURL(blob);
      });
    }
  }

  get letter() {
    return this.url ? '' : this.username ? this.username[0].toUpperCase() : '';
  }
}
