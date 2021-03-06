import { injectable } from 'inversify';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { DrawingCommands } from '../app/services/drawing-commands.service';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { BrushInfo } from '../../common/communication/brush-info';
import { Coord } from './commands/path';

export interface LobbyInfo {
  lobbyId: string;
  playerIds: string[];
  gameType: GameType;
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
export class Lobby {

  lobbyId: string;

  private size: number;

  private players: {
    accountId: string;
    playerStatus: PlayerStatus;
    socket: Socket;
  }[];

  private gameType: GameType;

  private io: Server;
  private drawingCommands: DrawingCommands;

  constructor(io: Server) {
    this.io = io;
    this.drawingCommands = new DrawingCommands();
    this.lobbyId = uuidv4();
    this.players = [];
    this.size = gameSizeMap.get(GameType.CLASSIC) as number;
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
      this.players.push({ accountId, playerStatus, socket });
      socket.join(this.lobbyId);
      this.bindLobbyEndPoints(socket);
    }
  }

  removePlayer(accountId: string, socket: Socket) {
    const index = this.players.findIndex((player) => player.accountId === accountId);
    if (index > -1) {
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
  }

}