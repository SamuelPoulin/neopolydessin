import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './account/account.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountNavbarComponent } from './account-navbar/account-navbar.component';
import { AccountSectionComponent } from './account-section/account-section.component';

@NgModule({
  imports: [SharedModule, RouterModule, NgApexchartsModule],
  declarations: [
    DashboardComponent,
    AccountComponent,
    ProfileComponent,
    SettingsComponent,
    AccountNavbarComponent,
    AccountSectionComponent,
  ],
})
export class AccountModule {}
