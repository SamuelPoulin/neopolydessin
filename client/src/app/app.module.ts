import { NgModule } from '@angular/core';
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
import { LobbyComponent } from '@components/pages/lobby/lobby/lobby.component';
import { LoginModule } from '@components/pages/login/login.module';
import { LoginComponent } from '@components/pages/login/login/login.component';
import { LobbyModule } from '@components/pages/lobby/lobby.module';
import { PasswordRecoveryComponent } from '@components/pages/login/password-recovery/password-recovery.component';
import { RegisterComponent } from '@components/pages/login/register/register.component';
import { SharedModule } from '@components/shared/shared.module';
import { AuthGuard } from '@services/auth-guard';
import { LoggedInGuard } from '@services/logged-in-guard';
import { ServerBrowserModule } from '@components/pages/server-browser/server-browser.module';
import { ServerBrowserComponent } from '@components/pages/server-browser/server-browser/server-browser.component';
import { PictureWordBrowserComponent } from '@components/pages/picture-word/picture-word-browser/picture-word-browser.component';
import { PictureWordModule } from '@components/pages/picture-word/picture-word.module';
import { GameEndModule } from '@components/pages/game-end/game-end.module';
import { GameEndComponent } from '@components/pages/game-end/game-end/game-end.component';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    SharedModule,
    HomeModule,
    ChatModule,
    AccountModule,
    EditorModule,
    LoginModule,
    LobbyModule,
    GameEndModule,
    ServerBrowserModule,
    PictureWordModule,
    RouterModule.forRoot(
      [
        { path: '', component: HomeComponent, canActivate: [AuthGuard] },
        { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },
        { path: 'edit', component: EditorComponent, canActivate: [AuthGuard] },
        { path: 'lobby', redirectTo: 'lobby/', pathMatch: 'full', canActivate: [AuthGuard] },
        { path: 'lobby/:id', component: LobbyComponent, canActivate: [AuthGuard] },
        { path: 'browser', component: ServerBrowserComponent, canActivate: [AuthGuard] },
        { path: 'gameend', component: GameEndComponent, canActivate: [AuthGuard] },
        { path: 'picture-word', component: PictureWordBrowserComponent, canActivate: [AuthGuard] },
        { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
        { path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard] },
        { path: 'password-recovery', component: PasswordRecoveryComponent, canActivate: [LoggedInGuard] },
        {
          path: 'account',
          component: AccountComponent,
          canActivate: [AuthGuard],
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
