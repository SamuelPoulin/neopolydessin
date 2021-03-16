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

  passwordRules: PasswordRule[] = new Array<PasswordRule>();

  constructor(private apiService: APIService, private userService: UserService, private router: Router, private snackBar: MatSnackBar) {
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
        this.userService.username = this.username;
        this.router.navigate(['/chat']); // todo - use constant?
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
        rule.verify();
      });
    }, 0);
  }

  private isPasswordIdentical() {
    return this.password === this.passwordConfirm;
  }

  private passwordHasDigit() {
    const expression = /\d/g;
    return expression.test(this.password);
  }

  private isPasswordLong() {
    return this.password.length > this.minPasswordLength;
  }
}
