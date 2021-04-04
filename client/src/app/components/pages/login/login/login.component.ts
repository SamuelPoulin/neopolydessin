import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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

  constructor(private userService: UserService, private snackBar: MatSnackBar, private router: Router) {}

  login() {
    this.userService
      .login(this.username, this.password)
      .then(() => {
        this.router.navigate(['']);
      })
      .catch(() => {
        this.snackBar.open("Erreur lors de l'authentification", 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
