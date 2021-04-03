import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SocketService } from '@services/socket-service.service';
import { Observable } from 'rxjs';
import { Difficulty, GameType, LobbyInfo } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss'],
})
export class ServerBrowserComponent implements OnInit {
  displayedColumns: string[] = ['lobbyName', 'playerInfo', 'gameType', 'joinButton'];
  dataSource: MatTableDataSource<LobbyInfo>;
  lobbyCount: number;

  constructor(private socketService: SocketService, private router: Router) {
    this.dataSource = new MatTableDataSource<LobbyInfo>();
  }

  ngOnInit() {
    this.socketService.getLobbyList(GameType.CLASSIC, Difficulty.EASY).subscribe((lobbies) => {
      this.dataSource.data = lobbies;
      this.lobbyCount = lobbies.length;
    });
  }

  joinLobby(lobbyId: string): void {
    this.socketService.joinLobby(lobbyId);
    this.router.navigate([`/lobby/${lobbyId}`]);
  }

  getGameTypeName(gameType: GameType) {
    switch (gameType) {
      case GameType.CLASSIC:
        return 'Classique';
      case GameType.SPRINT_COOP:
        return 'Co-op';
      default:
        return '';
    }
  }

  get showEmptyMessage(): boolean {
    return !this.lobbyCount || this.lobbyCount <= 0;
  }
}
