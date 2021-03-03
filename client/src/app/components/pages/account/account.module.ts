import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './account/account.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountNavbarComponent } from './account-navbar/account-navbar.component';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [DashboardComponent, AccountComponent, ProfileComponent, SettingsComponent, AccountNavbarComponent],
})
export class AccountModule {}

