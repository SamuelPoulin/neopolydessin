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

  @Input() set updateFlag(value: boolean) {
    this.updateAvatar();
  }

  @Input() mainUser: boolean;
  @Input() size: number;
  @Input() fontSize: number;

  color: string;
  url: string | undefined;

  constructor(private apiService: APIService, private userService: UserService) {
    this.color = '';
    this.size = 50;
    this.fontSize = 25;
  }

  ngOnInit() {
    this.color = randomColor({ seed: this.username, luminosity: 'bright' });
    this.getAvatar(false);
  }

  updateAvatar() {
    this.getAvatar(true);
  }

  private getAvatar(ignoreLocalStorage: boolean) {
    const reader = new FileReader();
    if (this.mainUser !== undefined) {
      if (this.userService.avatarBlob && !ignoreLocalStorage) {
        reader.readAsDataURL(this.userService.avatarBlob);
        reader.onloadend = () => {
          if (reader.result) {
            this.url = reader.result.toString();
          }
        };
      } else {
        this.userService
          .fetchAvatar()
          .then((avatarBlob) => {
            reader.readAsDataURL(avatarBlob);
            reader.onloadend = () => {
              if (reader.result) {
                this.url = reader.result.toString();
              }
            };
          })
          .catch(() => {
            this.url = undefined;
          });
      }
    }
    if (this.avatarId) {
      this.apiService
        .getAvatarById(this.avatarId)
        .then((blob: Blob) => {
          if (blob) {
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              if (reader.result) {
                this.url = reader.result.toString();
              }
            };
          }
        })
        .catch(() => {
          this.url = undefined;
        });
    }
  }

  get letter() {
    return this.url ? '' : this.username ? this.username[0].toUpperCase() : '';
  }
}
