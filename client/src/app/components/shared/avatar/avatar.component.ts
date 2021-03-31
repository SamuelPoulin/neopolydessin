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

  // TODO: REMOVE ANY
  ngOnInit() {
    this.color = randomColor({ seed: this.username, luminosity: 'bright' });

    const reader = new FileReader();
    if (this.mainUser !== undefined) {
      if (this.userService.avatarBlob) {
        reader.readAsDataURL(this.userService.avatarBlob);
        reader.onloadend = () => {
          if (reader.result) {
            this.url = reader.result.toString();
          }
        };
      } else {
        this.userService.fetchAvatar().then(() => {
          if (this.userService.avatarBlob) {
            reader.readAsDataURL(this.userService.avatarBlob);
            reader.onloadend = () => {
              if (reader.result) {
                this.url = reader.result.toString();
              }
            };
          }
        });
      }
    }
    if (this.avatarId) {
      // eslint-disable-next-line
      this.apiService.getAvatarById(this.avatarId).then((blob: any) => {
        if (blob) {
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            if (reader.result) {
              this.url = reader.result.toString();
            }
          };
        }
      });
    }
  }

  get letter() {
    return this.url ? '' : this.username ? this.username[0].toUpperCase() : '';
  }
}
