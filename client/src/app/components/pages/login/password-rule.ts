export class PasswordRule {
  private readonly INVALID_ICON: string = 'clear';
  private readonly VALID_ICON: string = 'done';

  private readonly VALID_CLASS: string = 'green';
  private readonly INVALID_CLASS: string = 'red';

  public icon: string;
  public class: string;
  public text: string;

  private _isValid: boolean;

  public get isValid() {
    return this._isValid;
  }

  public set isValid(valid: boolean) {
    this._isValid = valid;
    if (valid) {
      this.icon = this.VALID_ICON;
      this.class = this.VALID_CLASS
    } else {
      this.icon = this.INVALID_ICON;
      this.class = this.INVALID_CLASS
    }
  }
    

  constructor(text: string, public callback: () => boolean) {
    this.icon = this.INVALID_ICON;
    this.class = this.INVALID_CLASS;
    this.text = text;
  }

  verify(): void {
    this.isValid = this.callback();
  }


}