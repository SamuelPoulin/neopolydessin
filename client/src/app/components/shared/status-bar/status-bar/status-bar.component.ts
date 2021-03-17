import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent {
  @Input() quit: boolean;
  @Input() previousPage: string;

  constructor(private router: Router) {}

  navigateBack() {
    this.router.navigate([this.previousPage]);
  }
}
