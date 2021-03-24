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
  private readonly idMax: number = 1000000000000000000000;
  private readonly lobbyMax: number = 100;
  private readonly refreshInterval: number = 2000;

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
      }, this.refreshInterval);
    });
  }

  async dummyLobbies(): Promise<LobbyInfo[]> {
    return new Promise<LobbyInfo[]>((resolve, reject) => {
      const array = [];

      for (let i = 0; i < Math.random() * this.lobbyMax; i++) {
        array.push({
          playerInfo: [{ teamNumber: 1, playerName: 'Hello', accountId: '123' }],
          lobbyId: Math.floor(Math.random() * this.idMax).toString(),
          gameType: GameType.CLASSIC,
          lobbyName: '123',
        } as LobbyInfo);
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
