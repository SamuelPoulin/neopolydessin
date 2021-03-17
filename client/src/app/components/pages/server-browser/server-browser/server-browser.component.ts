import { Component } from '@angular/core';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss'],
})
export class ServerBrowserComponent {
  dummyData: any[] = [];
  displayedColumns: string[] = ['name'];

  constructor() {
    this.dummyData.push({ name: 'name1' } as any);
    this.dummyData.push({ name: 'name2' } as any);
    this.dummyData.push({ name: 'name3' } as any);
    this.dummyData.push({ name: 'name4' } as any);
  }
}
