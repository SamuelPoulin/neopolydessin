import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { Difficulty, GameType, PlayerStatus } from '../../common/communication/lobby';
import { Lobby } from './lobby';

@injectable()
export class LobbyCoop extends Lobby {

  private guessLeft: number;

  constructor(socketIdService: SocketIdService, databaseService: DatabaseService,
    io: Server, accountId: string, difficulty: Difficulty, privateGame: boolean)
  {
    super(socketIdService, databaseService, io, accountId, difficulty, privateGame);
    this.guessLeft = 5;
    this.gameType = GameType.SPRINT_COOP;
  }

  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.findPlayerById(accountId) && this.lobbyHasRoom()) {
      this.bindLobbyCoopEndPoints(socket);
    }
    super.addPlayer(accountId, playerStatus, socket);
  }

  bindLobbyCoopEndPoints(socket: Socket) {
    socket.on(SocketMessages.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
      const guesserAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      const guesserValues = this.players.find((element) => element.accountId === guesserAccountId);
      if (guesserValues?.playerStatus === PlayerStatus.GUESSER) {
        if (word === this.wordToGuess) {
          this.teams[guesserValues.teamNumber].currentScore++;
          callback(true);
        }
        else {
          this.guessLeft--;
          if (this.guessLeft === 0) {
            this.guessLeft = 5;
          }
          callback(false);
        }
      }
    });
  }
}