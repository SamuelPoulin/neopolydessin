import { inject } from 'inversify';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { DrawingCommands } from '../app/services/drawing-commands.service';
import types from '../app/types';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { Coord } from './commands/Path';

export enum GameType {
  CLASSIC = 'classic',
  SPRINT_SOLO = 'sprintSolo',
  SPRINT_COOP = 'sprintCoop'
}

const DEFAULT_TEAM_SIZE = 4;

const gameSizeMap = new Map<GameType, number>([
  [GameType.CLASSIC, DEFAULT_TEAM_SIZE],
  [GameType.SPRINT_SOLO, 2],
  [GameType.SPRINT_COOP, DEFAULT_TEAM_SIZE]
]);

export class Lobby {

  @inject(types.DrawingCommands) private drawingCommands: DrawingCommands;

  lobbyId: string;
  size: number;
  players: { accountId: string; socket: Socket }[];
  gameType: GameType;

  constructor() {
    this.lobbyId = uuidv4();
    this.players = [];
    this.size = gameSizeMap.get(GameType.CLASSIC) as number;
  }

  addPlayer(accountId: string, socket: Socket) {
    if (!this.players.includes({ accountId, socket })) {
      this.players.push({ accountId, socket });
      socket.join(this.lobbyId);
      this.bindLobbyEndPoints(socket);
    }
  }

  removePlayer(accountId: string, socket: Socket) {
    const index = this.players.indexOf({ accountId, socket });
    if (index > -1) {
      this.players.splice(index, 1);
      this.unbindLobbyEndPoints(socket);
    }
  }

  bindLobbyEndPoints(socket: Socket) {
    socket.on(SocketDrawing.START_PATH, (startPoint: Coord) => {
      this.drawingCommands.startPath(startPoint)
        .then(() => {
          socket.to(this.lobbyId).broadcast.emit(SocketDrawing.START_PATH, startPoint);
        })
        .catch(() => {
          console.log(`failed to start path for ${this.lobbyId}`);
        });
    });

    socket.on(SocketDrawing.UPDATE_PATH, (updatePoints: Coord[]) => {
      this.drawingCommands.updatePath(updatePoints)
        .then(() => {
          socket.to(this.lobbyId).broadcast.emit(SocketDrawing.UPDATE_PATH, updatePoints);
        })
        .catch(() => {
          console.log(`failed to update path for ${this.lobbyId}`);
        });

    });

    socket.on(SocketDrawing.END_PATH, (endPoint: Coord) => {
      this.drawingCommands.endPath(endPoint)
        .then(() => {
          socket.to(this.lobbyId).broadcast.emit(SocketDrawing.END_PATH, endPoint);
        })
        .catch(() => {
          console.log(`failed to end path for ${this.lobbyId}`);
        });

    });

    socket.on(SocketDrawing.ERASE, () => {
      this.drawingCommands.erase()
        .then(() => {
          socket.to(this.lobbyId).broadcast.emit(SocketDrawing.ERASE);
        })
        .catch(() => {
          console.log(`failed to erase for ${this.lobbyId}`);
        });

    });

    socket.on(SocketDrawing.UNDO, () => {
      this.drawingCommands.undo()
        .then(() => {
          socket.to(this.lobbyId).broadcast.emit(SocketDrawing.UNDO);
        })
        .catch(() => {
          console.log(`failed to undo for ${this.lobbyId}`);
        });

    });

    socket.on(SocketDrawing.REDO, () => {
      this.drawingCommands.redo()
        .then(() => {
          socket.to(this.lobbyId).broadcast.emit(SocketDrawing.REDO);
        })
        .catch(() => {
          console.log(`failed to redo for ${this.lobbyId}`);
        });

    });

  }

  unbindLobbyEndPoints(socket: Socket) {
    socket.removeAllListeners(SocketDrawing.START_PATH);
    socket.removeAllListeners(SocketDrawing.UPDATE_PATH);
    socket.removeAllListeners(SocketDrawing.END_PATH);
    socket.removeAllListeners(SocketDrawing.ERASE);
    socket.removeAllListeners(SocketDrawing.UNDO);
    socket.removeAllListeners(SocketDrawing.REDO);
  }

}