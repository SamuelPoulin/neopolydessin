import { injectable } from 'inversify';
import { Socket } from 'socket.io';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { Lobby, PlayerStatus } from './lobby';

@injectable()
export class LobbyCoop extends Lobby {
  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.players.find((player) => player.accountId === accountId) && this.players.length < this.size) {
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
          callback(false);
        }
      }
    });
  }
}