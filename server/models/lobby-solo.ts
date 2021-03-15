import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { SocketIdService } from '../app/services/socket-id.service';
import { Difficulty, GameType, Lobby, PlayerStatus } from './lobby';

@injectable()
export class LobbySolo extends Lobby {

  private readonly SOLO_TEAM_SIZE: number = 2;
  // private guessLeft: number;
  constructor(socketIdService: SocketIdService, io: Server, accountId: string, difficulty: Difficulty, privateGame: boolean) {
    super(socketIdService, io, accountId, difficulty, privateGame);
    this.size = this.SOLO_TEAM_SIZE;
    this.gameType = GameType.SPRINT_SOLO;
    // this.guessLeft = 5;
  }

  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.players.find((player) => player.accountId === accountId) && this.players.length < this.size) {
      this.bindLobbySoloEndPoints(socket);
    }
    super.addPlayer(accountId, playerStatus, socket);
  }

  bindLobbySoloEndPoints(socket: Socket) {
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