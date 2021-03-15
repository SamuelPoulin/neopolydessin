import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { SocketIdService } from '../app/services/socket-id.service';
import { Difficulty, GameType, Lobby, PlayerStatus } from './lobby';


@injectable()
export class LobbyClassique extends Lobby {

  constructor(socketIdService: SocketIdService, io: Server, accountId: string, difficulty: Difficulty, privateGame: boolean) {
    super(socketIdService, io, accountId, difficulty, privateGame);
    this.teams = [{ teamNumber: 0, currentScore: 0, playersInTeam: [] }, { teamNumber: 1, currentScore: 0, playersInTeam: [] }];
    this.gameType = GameType.CLASSIC;
  }

  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.findPlayerById(accountId) && this.lobbyHasRoom()) {
      if (this.teams[1].playersInTeam.length < this.teams[0].playersInTeam.length) {
        this.players.push({ accountId, playerStatus, socket, teamNumber: 0 });
        this.teams[0].playersInTeam.push({ accountId, playerStatus, socket, teamNumber: 0 });
      }
      else {
        this.players.push({ accountId, playerStatus, socket, teamNumber: 1 });
        this.teams[1].playersInTeam.push({ accountId, playerStatus, socket, teamNumber: 1 });
      }
      socket.join(this.lobbyId);
      this.bindLobbyEndPoints(socket);
      this.bindLobbyClassiqueEndPoints(socket);
    }
  }

  changeTeam(accountId: string, socket: Socket, teamNumber: number) {
    const index = this.players.findIndex((player) => player.accountId === accountId);
    if (index < -1 && this.teams[teamNumber].playersInTeam.length < (this.size / 2)) {
      const oldTeamIndex = this.teams[this.players[index].teamNumber].playersInTeam.findIndex((player) => player.accountId === accountId);
      if (oldTeamIndex) {
        this.teams[this.players[index].teamNumber].playersInTeam.splice(oldTeamIndex, 1);
      }
      this.players[index].teamNumber = teamNumber;
      this.teams[teamNumber].playersInTeam.push(this.players[index]);
    }
  }

  bindLobbyClassiqueEndPoints(socket: Socket) {
    socket.on(SocketMessages.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
      const guesserAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      const guesserValues = this.players.find((element) => element.accountId === guesserAccountId);
      if (guesserValues?.playerStatus === PlayerStatus.GUESSER) {
        if (word === this.wordToGuess) {
          this.teams[guesserValues.teamNumber].currentScore++;
          callback(true);
        }
        else {
          callback(false);
        }
      }
    });
  }
}