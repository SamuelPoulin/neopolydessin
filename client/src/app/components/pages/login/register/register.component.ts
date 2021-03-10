import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { APIService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { PasswordRule } from '../password-rule';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  passwordConfirm: string = '';

  public passwordRules = new Array<PasswordRule>();

  constructor(
    private API: APIService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { 
    this.passwordRules.push(
      new PasswordRule('Les mots de passe doivent être les mêmes', this.isPasswordIdentical),
      new PasswordRule('Doit contenir un chiffre', this.passwordHasDigit),
      new PasswordRule('Doit avoir une longueur minimale de 8 caractères', this.isPasswordLong),
    );
    this.updatePassword();
  }

  public register() {
    this.API.register(this.firstName, this.lastName, this.username, this.email, this.password)
      .then(() => {
        this.userService.username = this.username;
        this.router.navigate(['/chat']);   // todo - use constant?
      }).catch(err => {
        console.error(err);
        this.snackBar.open("Erreur de connexion", 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }

  public updatePassword() {
    window.setTimeout(() => {
    this.passwordRules.forEach(rule => {
      rule.verify();
    });
    }, 0);
  }

  private isPasswordIdentical = () => {
    return this.password === this.passwordConfirm;
  }

  private passwordHasDigit = () => {
    const expression = /\d/g;
    return expression.test(this.password);
  }

  private isPasswordLong = () => {
    return this.password.length > 8;
  }


}
