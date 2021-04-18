import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { SocketService } from '@services/socket-service.service';
import { Difficulty, GameType, LobbyInfo } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-server-browser',
  templateUrl: './server-browser.component.html',
  styleUrls: ['./server-browser.component.scss'],
})
export class ServerBrowserComponent implements OnInit {
  displayedColumns: string[] = ['lobbyName', 'playerInfo', 'gameType', 'difficulty', 'joinButton'];
  gamemodes: string[];
  difficulties: string[];

  dataSource: MatTableDataSource<LobbyInfo>;
  lobbyCount: number;
  selectedGamemode: string;
  selectedDifficulty: string;

  constructor(private socketService: SocketService, private gameService: GameService, private router: Router) {
    this.dataSource = new MatTableDataSource<LobbyInfo>();
    this.difficulties = ['Toutes', 'Facile', 'Intermédiaire', 'Difficile'];
    this.gamemodes = ['Tous', 'Classique', 'Co-op'];
    this.selectedDifficulty = 'Toutes';
    this.selectedGamemode = 'Tous';
  }

  ngOnInit() {
    this.socketService.receiveUpdateLobbies().subscribe((lobbies) => {
      this.dataSource.data = lobbies;
      this.lobbyCount = lobbies.length;
    });
    this.getLobbies();
  }

  getLobbies() {
    console.log('get');
    this.socketService
      .getLobbyList(
        this.selectedGamemode === 'Tous' ? undefined : this.gamemode,
        this.selectedDifficulty === 'Toutes' ? undefined : this.difficulty,
      )
      .then((lobbies) => {
        this.dataSource.data = lobbies;
        this.lobbyCount = lobbies.length;
      });
  }

  joinLobby(lobbyId: string, gameType: GameType, difficulty: Difficulty): void {
    this.socketService.joinLobby(lobbyId).then((lobbyInfo) => {
      this.gameService.setGameInfo(lobbyInfo);
      this.router.navigate([`/lobby/${lobbyId}`]);
    });
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

  getDifficultyName(difficulty: Difficulty) {
    switch (difficulty) {
      case Difficulty.EASY:
        return 'Facile';
      case Difficulty.INTERMEDIATE:
        return 'Intermédiaire';
      case Difficulty.HARD:
        return 'Difficile';
    }
  }

  get gamemode(): GameType {
    switch (this.selectedGamemode) {
      case 'Classique':
        return GameType.CLASSIC;
      case 'Co-op':
        return GameType.SPRINT_COOP;
      case 'Solo':
        return GameType.SPRINT_SOLO;
      default:
        return GameType.CLASSIC;
    }
  }

  get difficulty(): Difficulty {
    switch (this.selectedDifficulty) {
      case 'Facile':
        return Difficulty.EASY;
      case 'Intermédiaire':
        return Difficulty.INTERMEDIATE;
      case 'Difficile':
        return Difficulty.HARD;
      default:
        return Difficulty.EASY;
    }
  }

  get showEmptyMessage(): boolean {
    return !this.lobbyCount || this.lobbyCount <= 0;
  }
}
