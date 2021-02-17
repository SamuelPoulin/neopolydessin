import { Component } from '@angular/core';
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

  constructor(private socketService: SocketService, private router: Router, private userService: UserService) {}

  login() {
    this.socketService.newPlayer(this.inputValue).then((valid) => {
      if (valid) {
        this.userService.username = this.inputValue;
        this.router.navigate(['chat']);
      }
      else {
        console.log('Go back to the ... MEGA GAYZONE');
      }
    });
  }
}
