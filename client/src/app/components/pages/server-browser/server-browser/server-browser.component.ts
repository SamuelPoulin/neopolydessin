import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
// import { Router } from '@angular/router';
// import { SocketService } from '@services/socket-service.service';
import { Observable } from 'rxjs';
import { Difficulty, GameType, LobbyInfo } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss'],
})
export class ServerBrowserComponent implements OnInit {
  displayedColumns: string[] = ['lobbyId', 'playerInfo', 'gameType', 'joinButton'];
  dataSource: MatTableDataSource<LobbyInfo>;
  lobbyCount: number;

  constructor() // private socketService: SocketService,
  // private router: Router
  {
    this.dataSource = new MatTableDataSource<LobbyInfo>();
  }

  ngOnInit() {
    this.getLobbyList(GameType.CLASSIC, Difficulty.EASY).subscribe((lobbies) => {
      this.dataSource.data = lobbies;
      this.lobbyCount = lobbies.length;
    });
  }

  getLobbyList(gameType: GameType, difficulty: Difficulty): Observable<LobbyInfo[]> {
    return new Observable<LobbyInfo[]>((msgObs) => {
      setInterval(() => {
        this.dummyLobbies().then((lobbies) => {
          msgObs.next(lobbies);
        });
      }, 2000);
    });
  }

  async dummyLobbies(): Promise<LobbyInfo[]> {
    return new Promise<LobbyInfo[]>((resolve, reject) => {
      const array = [];

      for (let i = 0; i < Math.random() * 100; i++) {
        array.push({
          playerInfo: [{ teamNumber: 1, playerName: 'Hello', accountId: '123' }],
          lobbyId: Math.floor(Math.random() * 1000000000000000000000).toString(),
          gameType: GameType.CLASSIC,
        });
      }

      resolve(array);
    });
  }

  joinLobby(lobbyId: string): void {
    console.log(lobbyId);
    // this.socketService.joinLobby(lobbyId);
    // this.router.navigate(['/edit']);
  }

  get showEmptyMessage(): boolean {
    return !this.lobbyCount || this.lobbyCount <= 0;
  }
}
