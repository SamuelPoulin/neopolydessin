import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {

  constructor(
    private snackBar: MatSnackBar,
    private userService: UserService,
  ) { }

  firstName: string | undefined;
  lastName: string | undefined;
  username: string | undefined;
  email: string | undefined;

  updateAccount() {
    this.userService.updateAccount(this.firstName, this.lastName, this.username, this.email)
      .catch((err) => {
        this.sendNotification('Le nom d\'utilisateur et/ou le courriel sont déjà pris!');
      });
  }

  sendNotification(message: string) {
    this.snackBar.open(message, 'Ok', {
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
