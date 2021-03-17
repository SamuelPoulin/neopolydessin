import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from '@services/api.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  currentError: string = '';

  constructor(private apiService: APIService, private userService: UserService, private snackBar: MatSnackBar) {}

  login() {
    this.apiService
      .login(this.username, this.password)
      .then(() => {
        this.userService.login(this.username);
      })
      .catch((err) => {
        console.error(err);
        this.snackBar.open('Erreur de connexion', 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }
}
