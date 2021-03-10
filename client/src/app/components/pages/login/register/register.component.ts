import { Component } from '@angular/core';
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

  constructor() { 
    this.passwordRules.push(
      new PasswordRule('Les mots de passe doivent être les mêmes', this.isPasswordIdentical),
      new PasswordRule('Doit contenir un chiffre', this.passwordHasDigit),
      new PasswordRule('Doit avoir une longueur minimale de 8 caractères', this.isPasswordLong),
    );
    this.updatePassword();
  }

  public register() {
  }

  public updatePassword() {
    window.setTimeout(() => {
    this.passwordRules.forEach(rule => {
      rule.verify();
    });
    }, 0);
  }

  private isPasswordIdentical = () => {
    console.log(this);
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
