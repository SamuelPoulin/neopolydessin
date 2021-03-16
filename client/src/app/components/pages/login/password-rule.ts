import { RegisterComponent } from './register/register.component';

export class PasswordRule {
  private readonly invalidIcon: string = 'clear';
  private readonly validIcon: string = 'done';

  private readonly validClass: string = 'green';
  private readonly invalidClass: string = 'red';

  icon: string;
  class: string;
  text: string;

  private _isValid: boolean;

  get isValid() {
    return this._isValid;
  }

  set isValid(valid: boolean) {
    this._isValid = valid;
    if (valid) {
      this.icon = this.validIcon;
      this.class = this.validClass;
    } else {
      this.icon = this.invalidIcon;
      this.class = this.invalidClass;
    }
  }

  constructor(text: string, public callback: (registerComponent: RegisterComponent) => boolean) {
    this.icon = this.invalidIcon;
    this.class = this.invalidClass;
    this.text = text;
  }

  verify(registerComponent: RegisterComponent): void {
    this.isValid = this.callback(registerComponent);
  }
}
