import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { APIService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { PasswordRule } from '../password-rule';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private readonly minPasswordLength: number = 8;

  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  passwordConfirm: string = '';

  passwordRules: PasswordRule[] = [];

  constructor(private apiService: APIService, private userService: UserService, private snackBar: MatSnackBar, private router: Router) {
    this.passwordRules.push(
      new PasswordRule('Les mots de passe doivent être les mêmes', this.isPasswordIdentical),
      new PasswordRule('Doit contenir un chiffre', this.passwordHasDigit),
      new PasswordRule('Doit avoir une longueur minimale de 8 caractères', this.isPasswordLong),
    );
    this.updatePassword();
  }

  register() {
    this.apiService
      .register(this.firstName, this.lastName, this.username, this.email, this.password)
      .then(() => {
        this.userService.login(this.username);
        this.router.navigate(['']);
      })
      .catch((err: Error) => {
        console.error(err);
        this.snackBar.open('Erreur de connexion', 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }

  updatePassword() {
    window.setTimeout(() => {
      this.passwordRules.forEach((rule) => {
        rule.verify(this);
      });
    }, 0);
  }

  private isPasswordIdentical = (registerComponent: RegisterComponent): boolean => {
    return registerComponent.password === registerComponent.passwordConfirm;
  };

  private passwordHasDigit = (registerComponent: RegisterComponent): boolean => {
    const expression = /\d/g;
    return expression.test(registerComponent.password);
  };

  private isPasswordLong = (registerComponent: RegisterComponent): boolean => {
    return registerComponent.password.length > registerComponent.minPasswordLength;
  };

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
