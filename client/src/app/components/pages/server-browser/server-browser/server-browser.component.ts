import { Component } from '@angular/core';
import { SocketService } from '@services/socket-service.service';
import { Subscription } from 'rxjs';
import { Difficulty, GameType, LobbyInfo } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss'],
})
export class ServerBrowserComponent {
  dummyData: any[] = [];
  displayedColumns: string[] = ['name'];
  lobbiesSubscription: Subscription;
  lobbies: LobbyInfo[] = [];

  constructor(private socketService: SocketService) {
    this.dummyData.push({ name: 'name1' } as any);
    this.dummyData.push({ name: 'name2' } as any);
    this.dummyData.push({ name: 'name3' } as any);
    this.dummyData.push({ name: 'name4' } as any);

    this.socketService.getLobbyList(GameType.CLASSIC, Difficulty.EASY).then((lobbies) => {
      for (const lobby of lobbies) {
        this.lobbies.push(lobby);
      }

      console.log(this.lobbies);
    });
  }
}
