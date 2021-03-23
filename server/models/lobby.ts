/* eslint-disable max-lines */
import { inject, injectable } from 'inversify';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { DrawingCommandsService } from '../app/services/drawing-commands.service';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { BrushInfo } from '../../common/communication/brush-info';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { SocketIdService } from '../app/services/socket-id.service';
import Types from '../app/types';
import { SocketIo } from '../app/socketio';
import { DatabaseService } from '../app/services/database.service';
import { ChatMessage, Message } from '../../common/communication/chat-message';
import { Coord } from './commands/path';

export interface LobbyInfo {
  lobbyId: string;
  lobbyName: string;
  playerInfo: PlayerInfo[];
  gameType: GameType;
}

export interface PlayerInfo {
  teamNumber: number;
  playerName: string;
  accountId: string;
}

export interface Player {
  accountId: string;
  username: string;
  playerStatus: PlayerStatus;
  socket: Socket;
  teamNumber: number;
}

export interface PlayerRole {
  playerName: string;
  playerStatus: PlayerStatus;
}

export enum GameType {
  CLASSIC = 'classic',
  SPRINT_SOLO = 'sprintSolo',
  SPRINT_COOP = 'sprintCoop'
}

export enum Difficulty {
  EASY = 'easy',
  INTERMEDIATE = 'intermediate',
  HARD = 'hard'
}

export enum PlayerStatus {
  DRAWER = 'active',
  GUESSER = 'guesser',
  PASSIVE = 'passive'
}

export enum CurrentGameState {
  LOBBY = 'lobby',
  IN_GAME = 'game',
  DRAWING = 'draw',
  REPLY = 'reply',
  GAME_OVER = 'over'
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
  readonly MS_PER_SEC: number = 1000;

  lobbyId: string;
  gameType: GameType;
  difficulty: Difficulty;
  privateLobby: boolean;
  lobbyName: string;

  protected io: Server;
  protected ownerAccountId: string;
  protected ownerUsername: string;

  protected size: number;
  protected wordToGuess: string;
  protected currentGameState: CurrentGameState;
  protected drawingCommands: DrawingCommandsService;
  protected timeLeftSeconds: number;

  protected players: Player[];
  protected teams: {
    teamNumber: number;
    currentScore: number;
    playersInTeam: Player[];
  }[];

  constructor(
    @inject(Types.SocketIdService) protected socketIdService: SocketIdService,
    @inject(Types.DatabaseService) protected databaseService: DatabaseService,
    io: Server,
    accountId: string,
    difficulty: Difficulty,
    privacySetting: boolean,
    lobbyName: string
  ) {
    this.io = io;
    this.ownerAccountId = accountId;
    this.databaseService.getAccountById(accountId).then((account) => {
      this.ownerUsername =  account.documents.username;
    });
    this.difficulty = difficulty;
    this.privateLobby = privacySetting;
    this.lobbyName = lobbyName;
    this.lobbyId = uuidv4();
    this.size = gameSizeMap.get(GameType.CLASSIC) as number;
    this.wordToGuess = '';
    this.currentGameState = CurrentGameState.LOBBY;
    this.drawingCommands = new DrawingCommandsService();
    this.players = [];
    this.teams = [{ teamNumber: 0, currentScore: 0, playersInTeam: [] }];
  }

  async toLobbyInfo(): Promise<LobbyInfo> {
    const playerInfoList: PlayerInfo[] = [];
    const listAccountId: string[] = [];
    this.players.forEach((player) => {
      listAccountId.push(player.accountId);
    });
    return await this.databaseService.getAccountsInfo(listAccountId).then((listPlayers) => {
      listPlayers.documents.forEach((playerInfo, index) => {
        playerInfoList.push({
          teamNumber: this.players[index].teamNumber,
          playerName: playerInfo.username,
          accountId: playerInfo.accountId
        });
      });
      return {
        lobbyId: this.lobbyId,
        lobbyName: this.lobbyName,
        playerInfo: playerInfoList,
        gameType: this.gameType,
      };
    });
  }

  async addPlayer(accountIdPlayer: string, status: PlayerStatus, socketPlayer: Socket) {
    if (!this.findPlayerById(accountIdPlayer) && this.lobbyHasRoom()) {
      this.databaseService.getAccountById(accountIdPlayer).then((account) => {
        const playerName = account.documents.username;
        const player: Player = {
          accountId: accountIdPlayer,
          username: playerName,
          playerStatus: status,
          socket: socketPlayer,
          teamNumber: 0
        };

        this.players.push(player);
        this.teams[0].playersInTeam.push(player);
        socketPlayer.join(this.lobbyId);
        this.bindLobbyEndPoints(socketPlayer);
      });
    }
  }

  getOwnerName(): string {
    return this.ownerUsername;
  }

  getallPlayerNames(): string[]{
    return this.players.map((player: Player) => {
      return player.username;
    });
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
      if (this.players.length === 0) {
        this.endGame();
      }
      else {
        if (accountId === this.ownerAccountId) {
          this.ownerAccountId = this.players[0].accountId;
          this.ownerUsername = this.players[0].username;
        }
      }
    }
  }

  isActivePlayer(socket: Socket): boolean {
    const playerInfo = this.findPlayerBySocket(socket);
    if (playerInfo) {
      return playerInfo.playerStatus === PlayerStatus.DRAWER;
    } else {
      return false;
    }
  }

  setPrivacySetting(socketId: string, newPrivacySetting: boolean) {
    const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socketId);
    if (senderAccountId === this.ownerAccountId) {
      this.privateLobby = newPrivacySetting;
    }
  }

  endGame(): void {
    this.currentGameState = CurrentGameState.GAME_OVER;
    this.io.in(this.lobbyId).emit(SocketMessages.END_GAME);
    SocketIo.GAME_SUCCESSFULLY_ENDED.notify(this.lobbyId);
  }

  findPlayerById(accountId: string): Player | undefined {
    return this.players.find((player) => player.accountId === accountId);
  }

  findPlayerBySocket(socket: Socket): Player | undefined {
    return this.players.find((player) => player.socket === socket);
  }

  lobbyHasRoom(): boolean {
    return this.players.length < this.size;
  }

  validateMessageLength(msg: Message): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

  bindLobbyEndPoints(socket: Socket) {

    // bind other lobby relevant endpoints here <----- StartGame and such

    socket.on(SocketDrawing.START_PATH, (startPoint: Coord, brushInfo: BrushInfo) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.startPath(startPoint, brushInfo)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.START_PATH_BC, startPoint, brushInfo);
          })
          .catch(() => {
            console.log(`failed to start path for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.UPDATE_PATH, (updateCoord: Coord) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.updatePath(updateCoord)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.UPDATE_PATH_BC, updateCoord);
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
      this.io.in(this.lobbyId).emit(SocketMessages.EMIT_NEW_PRIVACY_SETTING, this.privateLobby);
    });

    socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: Message) => {
      if (this.validateMessageLength(sentMsg)) {
        const player = this.findPlayerBySocket(socket);
        if (player) {
          const messageWithUsername: ChatMessage = {
            content: sentMsg.content,
            timestamp: sentMsg.timestamp,
            senderUsername: player.username
          };
          socket.to(this.lobbyId).broadcast.emit(SocketMessages.RECEIVE_MESSAGE, messageWithUsername);
        }
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
    socket.removeAllListeners(SocketMessages.START_GAME_SERVER);
  }
}