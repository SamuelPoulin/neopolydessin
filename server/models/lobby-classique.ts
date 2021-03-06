import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { Lobby, PlayerStatus } from './lobby';


@injectable()
export class LobbyClassique extends Lobby {

  constructor(io: Server) {
    super(io);
    this.teams = [{teamNumber: 1, currentScore: 0, playersInTeam: []}, {teamNumber: 2, currentScore: 0, playersInTeam: []}];
  }

  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.players.find((player) => player.accountId === accountId) && this.players.length < this.size) {
      if (this.teams[1].playersInTeam.length < this.teams[0].playersInTeam.length) {
        this.players.push({ accountId, playerStatus, socket , teamNumber: 0});
        this.teams[0].playersInTeam.push({ accountId, playerStatus, socket , teamNumber: 0});
      }
      else {
        this.players.push({ accountId, playerStatus, socket , teamNumber: 1});
        this.teams[1].playersInTeam.push({ accountId, playerStatus, socket , teamNumber: 1});
      }
      socket.join(this.lobbyId);
      this.bindLobbyEndPoints(socket);
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
}