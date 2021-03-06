import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlphaComponent } from 'src/app/components/shared/color-picker/color-strip/alpha/alpha.component';
import { ColorLightnessComponent } from 'src/app/components/shared/color-picker/color-strip/color-lightness/color-lightness.component';
import { CustomInputComponent } from 'src/app/components/shared/inputs/custom-input/custom-input.component';
import { HexInputComponent } from 'src/app/components/shared/inputs/hex-input/hex-input.component';
import { NumberInputComponent } from 'src/app/components/shared/inputs/number-input/number-input.component';
import { LayoutModule } from '@angular/cdk/layout';
import { BrowserModule } from '@angular/platform-browser';
import { NgxElectronModule } from 'ngx-electron';
import { ColorPickerModule } from 'ngx-color-picker';
import { AbstractModalComponent } from './abstract-modal/abstract-modal.component';
import { ConfirmModalComponent } from './abstract-modal/confirm-modal/confirm-modal/confirm-modal.component';
import { ColorHistoryComponent } from './color-picker/color-history/color-history.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { EmailInputComponent } from './inputs/email-input/email-input.component';
import { IconButtonComponent } from './inputs/icon-button/icon-button.component';
import { DrawingNameInputComponent } from './inputs/drawing-name-input/drawing-name-input.component';
import { EnumPropertyInputComponent } from './inputs/property-inputs/enum-property-input/enum-property-input.component';
import { NumericPropertyInputComponent } from './inputs/property-inputs/numeric-property-input/numeric-property-input.component';
import { TagInputComponent } from './inputs/tag-input/tag-input.component';
import { TagListInputComponent } from './inputs/tag-list-input/tag-list-input.component';
import { UsernameInputComponent } from './inputs/username-input/username-input.component';
import { NameInputComponent } from './inputs/name-input/name-input.component';
import { PasswordInputComponent } from './inputs/password-input/password-input.component';
import { GamemodeTitleComponent } from './gamemode-title/gamemode-title.component';
import { AvatarComponent } from './avatar/avatar.component';
import { TeamComponent } from './team/team.component';
import { TutorialComponent } from './tutorial/tutorial.component';

@NgModule({
  imports: [
    NgxElectronModule,
    BrowserModule,
    LayoutModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSidenavModule,
    MatExpansionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatListModule,
    HttpClientModule,
    MatSelectModule,
    MatTreeModule,
    MatTooltipModule,
    ColorPickerModule,
  ],
  declarations: [
    AbstractModalComponent,
    ColorPickerComponent,
    ColorLightnessComponent,
    AlphaComponent,
    EmailInputComponent,
    NumberInputComponent,
    CustomInputComponent,
    HexInputComponent,
    TagInputComponent,
    TagListInputComponent,
    DrawingNameInputComponent,
    UsernameInputComponent,
    NameInputComponent,
    ColorHistoryComponent,
    ConfirmModalComponent,
    NumericPropertyInputComponent,
    EnumPropertyInputComponent,
    IconButtonComponent,
    PasswordInputComponent,
    GamemodeTitleComponent,
    AvatarComponent,
    TeamComponent,
    TutorialComponent,
  ],
  exports: [
    AbstractModalComponent,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatSliderModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSidenavModule,
    ColorPickerComponent,
    EmailInputComponent,
    NumberInputComponent,
    CustomInputComponent,
    HexInputComponent,
    TagInputComponent,
    TagListInputComponent,
    DrawingNameInputComponent,
    UsernameInputComponent,
    NameInputComponent,
    ColorHistoryComponent,
    AlphaComponent,
    MatExpansionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatSelectModule,
    NumericPropertyInputComponent,
    EnumPropertyInputComponent,
    IconButtonComponent,
    PasswordInputComponent,
    GamemodeTitleComponent,
    AvatarComponent,
    TeamComponent,
    TutorialComponent,
    ColorPickerModule,
  ],
})
export class SharedModule {}
