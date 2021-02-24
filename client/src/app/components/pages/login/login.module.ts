import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  imports: [SharedModule],
  declarations: [LoginComponent, RegisterComponent],
})
export class LoginModule {}
