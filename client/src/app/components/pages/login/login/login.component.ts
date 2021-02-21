import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SocketService } from '@services/socket-service.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  inputValue: string = '';
  currentError: string = '';

  constructor(
    private socketService: SocketService,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {}

  login() {
    this.socketService.newPlayer(this.inputValue).then((valid) => {
      if (valid) {
        this.userService.username = this.inputValue;
        this.router.navigate(['chat']);
      } else {
        this.snackBar.open("Ce nom d'utilisateur est non disponible.", 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      }
    });
  }
}
