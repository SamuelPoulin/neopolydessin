import { inject, injectable } from 'inversify';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { DrawingCommands } from '../app/services/drawing-commands.service';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { BrushInfo } from '../../common/communication/brush-info';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { ChatMessage } from '../../common/communication/chat-message';
import { SocketIdService } from '../app/services/socket-id.service';
import Types from '../app/types';
import { Coord } from './commands/path';

export interface LobbyInfo {
  lobbyId: string;
  playerIds: string[];
  gameType: GameType;
}

export interface Player {
  accountId: string;
  playerStatus: PlayerStatus;
  socket: Socket;
  teamNumber: number;
}

export enum GameType {
  CLASSIC = 'classic',
  SPRINT_SOLO = 'sprintSolo',
  SPRINT_COOP = 'sprintCoop'
}

export enum PlayerStatus {
  DRAWER = 'active',
  GUESSER = 'guesser',
  PASSIVE = 'passive'
}

const DEFAULT_TEAM_SIZE = 4;

const gameSizeMap = new Map<GameType, number>([
  [GameType.CLASSIC, DEFAULT_TEAM_SIZE],
  [GameType.SPRINT_SOLO, 2],
  [GameType.SPRINT_COOP, DEFAULT_TEAM_SIZE]
]);

@injectable()
export abstract class Lobby {

  readonly MAX_LENGTH_MSG: number = 200;
  lobbyId: string;

  protected size: number;

  protected teams: {
    teamNumber: number;
    currentScore: number;
    playersInTeam: Player[];
  }[];

  protected players: Player [];

  protected wordToGuess: string;
  protected ownerAccountId: string;
  protected gameType: GameType;

  protected privateGame: boolean;
  protected io: Server;
  protected drawingCommands: DrawingCommands;

  constructor(@inject(Types.SocketIdService) protected socketIdService: SocketIdService,
    io: Server, accountId: string, privacySetting: boolean) {
    this.io = io;
    this.wordToGuess = '';
    this.ownerAccountId = accountId;
    this.privateGame = privacySetting;
    this.drawingCommands = new DrawingCommands();
    this.lobbyId = uuidv4();
    this.players = [];
    this.teams = [{teamNumber: 0, currentScore: 0, playersInTeam: []}];
    this.size = gameSizeMap.get(GameType.CLASSIC) as number;
    this.socketIdService = new SocketIdService();
  }

  toLobbyInfo(): LobbyInfo {
    return {
      lobbyId: this.lobbyId,
      playerIds: this.players.map((player) => { return player.accountId; }),
      gameType: this.gameType,
    };
  }

  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.players.find((player) => player.accountId === accountId) && this.players.length < this.size) {
      this.players.push({ accountId, playerStatus, socket , teamNumber: 0});
      this.teams[0].playersInTeam.push({ accountId, playerStatus, socket , teamNumber: 0});
      socket.join(this.lobbyId);
      this.bindLobbyEndPoints(socket);
    }
  }

  removePlayer(accountId: string, socket: Socket) {
    const index = this.players.findIndex((player) => player.accountId === accountId);
    if (index > -1) {
      const teamIndex = this.teams[this.players[index].teamNumber].playersInTeam.findIndex(((player) => player.accountId === accountId));
      if (teamIndex > -1) {
        this.teams[this.players[index].teamNumber].playersInTeam.splice(teamIndex, 1);
      }
      this.players.splice(index, 1);
      this.unbindLobbyEndPoints(socket);
    }
  }

  isActivePlayer(socket: Socket): boolean {
    const playerInfo = this.players.find((player) => player.socket === socket);
    if (playerInfo) {
      return playerInfo.playerStatus === PlayerStatus.DRAWER;
    } else {
      return false;
    }
  }

  setPrivacySetting(socketId: string, newPrivacySetting: boolean) {
    const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socketId);
    if (senderAccountId === this.ownerAccountId) {
      this.privateGame = newPrivacySetting;
    }
  }

  bindLobbyEndPoints(socket: Socket) {

    // bind other lobby relevant endpoints here <----- StartGame and such

    socket.on(SocketDrawing.START_PATH, (startPoint: Coord, brushInfo: BrushInfo) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.startPath(startPoint, brushInfo)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.START_PATH_BC, startPoint);
          })
          .catch(() => {
            console.log(`failed to start path for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.UPDATE_PATH, (updatePoints: Coord[]) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.updatePath(updatePoints)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.UPDATE_PATH_BC, updatePoints);
          })
          .catch(() => {
            console.log(`failed to update path for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.END_PATH, (endPoint: Coord) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.endPath(endPoint)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.END_PATH_BC, endPoint);
          })
          .catch(() => {
            console.log(`failed to end path for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.START_ERASE, (startPoint: Coord) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.startErase(startPoint)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.START_ERASE_BC, startPoint);
          })
          .catch(() => {
            console.log(`failed to start erase for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.UPDATE_ERASE, (coords: Coord[]) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.updateErase(coords)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.UPDATE_ERASE_BC, coords);
          })
          .catch(() => {
            console.log(`failed to update erase for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.END_ERASE, (endPoint: Coord) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.endErase(endPoint)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.END_ERASE_BC, endPoint);
          })
          .catch(() => {
            console.log(`failed to end erase for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.UNDO, () => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.undo()
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.UNDO_BC);
          })
          .catch(() => {
            console.log(`failed to undo for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.REDO, () => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.redo()
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.REDO_BC);
          })
          .catch(() => {
            console.log(`failed to redo for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketMessages.SET_GAME_PRIVACY, (privacySetting: boolean) => {
      this.setPrivacySetting(socket.id, privacySetting);
      this.io.in(this.lobbyId).emit(SocketMessages.EMIT_NEW_PRIVACY_SETTING, this.privateGame);
    });

    socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
      if (this.validateMessageLength(sentMsg)) {
        socket.to(this.lobbyId).broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
      }
      else {
        console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
      }
    });

  }

  unbindLobbyEndPoints(socket: Socket) {
    socket.removeAllListeners(SocketDrawing.START_PATH);
    socket.removeAllListeners(SocketDrawing.UPDATE_PATH);
    socket.removeAllListeners(SocketDrawing.END_PATH);
    socket.removeAllListeners(SocketDrawing.START_ERASE);
    socket.removeAllListeners(SocketDrawing.UPDATE_ERASE);
    socket.removeAllListeners(SocketDrawing.END_ERASE);
    socket.removeAllListeners(SocketDrawing.UNDO);
    socket.removeAllListeners(SocketDrawing.REDO);
    socket.removeAllListeners(SocketMessages.SET_GAME_PRIVACY);
    socket.removeAllListeners(SocketMessages.SEND_MESSAGE);
    socket.removeAllListeners(SocketMessages.PLAYER_GUESS);
  }

  validateMessageLength(msg: ChatMessage): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

}