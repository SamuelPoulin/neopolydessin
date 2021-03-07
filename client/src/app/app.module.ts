import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccountModule } from '@components/pages/account/account.module';
import { AccountComponent } from '@components/pages/account/account/account.component';
import { DashboardComponent } from '@components/pages/account/dashboard/dashboard.component';
import { ProfileComponent } from '@components/pages/account/profile/profile.component';
import { SettingsComponent } from '@components/pages/account/settings/settings.component';
import { ChatModule } from '@components/pages/chat/chat.module';
import { ChatComponent } from '@components/pages/chat/chat/chat.component';
import { EditorModule } from '@components/pages/editor/editor.module';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { HomeModule } from '@components/pages/home/home.module';
import { HomeComponent } from '@components/pages/home/home/home.component';
import { LoginModule } from '@components/pages/login/login.module';
import { LoginComponent } from '@components/pages/login/login/login.component';
import { UserGuideModule } from '@components/pages/user-guide/user-guide.module';
import { SharedModule } from '@components/shared/shared.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
    HomeModule,
    ChatModule,
    AccountModule,
    EditorModule,
    UserGuideModule,
    LoginModule,
    RouterModule.forRoot(
      [
        { path: '', component: HomeComponent },
        { path: 'login', component: LoginComponent },
        { path: 'edit', component: EditorComponent },
        { path: 'chat', component: ChatComponent },
        {
          path: 'account',
          component: AccountComponent,
          children: [
            { path: '', component: DashboardComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'settings', component: SettingsComponent },
          ],
        },
      ],
      { useHash: true },
    ),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
