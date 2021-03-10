import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [LoginComponent, RegisterComponent, PasswordRecoveryComponent],
})
export class LoginModule {}
