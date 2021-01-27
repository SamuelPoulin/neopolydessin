import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MatSidenav } from '@angular/material/sidenav';
import { GuideSubject } from 'src/app/components/pages/user-guide/user-guide/guide-subject.enum';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';

@Component({
  selector: 'app-user-guide-modal',
  templateUrl: './user-guide-modal.component.html',
  styleUrls: ['./user-guide-modal.component.scss'],
})
export class UserGuideModalComponent extends AbstractModalComponent implements OnInit {
  @ViewChild('sidenav', { static: false })
  sidenav: MatSidenav;
  subjects: typeof GuideSubject = GuideSubject;
  selectedSubject: GuideSubject;
  panelOpenState1: boolean;
  panelOpenState2: boolean;
  panelOpenState3: boolean;

  constructor(public dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);
    this.panelOpenState1 = false;
    this.panelOpenState2 = false;
    this.panelOpenState3 = false;
  }

  ngOnInit(): void {
    this.selectedSubject = this.subjects.Welcome;
  }
  selectSubject(selection: GuideSubject): void {
    this.selectedSubject = selection;
  }

  private openCategories(): void {
    this.panelOpenState1 = true;
    this.panelOpenState2 = true;
    this.panelOpenState3 = true;
  }

  previousSubject(): void {
    this.selectSubject(this.selectedSubject - 1);
    this.openCategories();
  }

  nextSubject(): void {
    this.selectSubject(this.selectedSubject + 1);
    this.openCategories();
  }

  get disablePreviousButton(): boolean {
    return this.selectedSubject === this.subjects.Welcome;
  }

  get disableNextButton(): boolean {
    return this.selectedSubject === this.subjects.Reinitialisation;
  }
}
