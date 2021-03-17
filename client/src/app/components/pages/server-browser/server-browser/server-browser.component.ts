import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@services/socket-service.service';
import { Subscription } from 'rxjs';
import { Difficulty, GameType, LobbyInfo } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss'],
})
export class ServerBrowserComponent implements OnInit {
  displayedColumns: string[] = ['lobbyId'];
  lobbiesSubscription: Subscription;
  lobbies: LobbyInfo[] = [];

  constructor(private socketService: SocketService, private router: Router) {}

  ngOnInit() {
    this.socketService.getLobbyList(GameType.CLASSIC, Difficulty.EASY).subscribe((lobbies) => {
      this.lobbies.push(...lobbies);
    });
  }

  joinLobby(lobbyId: string): void {
    this.socketService.joinLobby(lobbyId);
    this.router.navigate(['/edit']);
  }
}
