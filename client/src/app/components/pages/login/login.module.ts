import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [LoginComponent, RegisterComponent, PasswordRecoveryComponent],
})
export class LoginModule {}
