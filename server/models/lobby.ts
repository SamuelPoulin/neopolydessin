import { inject, injectable } from 'inversify';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { DrawingService } from '../app/services/drawing.service';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { BrushInfo } from '../../common/communication/brush-info';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { ChatMessage } from '../../common/communication/chat-message';
import { SocketIdService } from '../app/services/socket-id.service';
import Types from '../app/types';
import { SocketIo } from '../app/socketio';
import { DatabaseService } from '../app/services/database.service';
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
  avatar: string | undefined;
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

  lobbyId: string;
  gameType: GameType;
  difficulty: Difficulty;
  privateLobby: boolean;
  lobbyName: string;

  protected io: Server;
  protected ownerAccountId: string;

  protected size: number;
  protected wordToGuess: string;
  protected currentGameState: CurrentGameState;
  protected drawingCommands: DrawingService;
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
    this.difficulty = difficulty;
    this.privateLobby = privacySetting;
    this.lobbyName = lobbyName;
    this.lobbyId = uuidv4();
    this.size = gameSizeMap.get(GameType.CLASSIC) as number;
    this.wordToGuess = '';
    this.currentGameState = CurrentGameState.LOBBY;
    this.drawingCommands = new DrawingService();
    this.timeLeftSeconds = 0;
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
          accountId: playerInfo.accountId,
          avatar: playerInfo.avatar
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

  addPlayer(accountId: string, playerStatus: PlayerStatus, socket: Socket) {
    if (!this.findPlayerById(accountId) && this.lobbyHasRoom()) {
      this.players.push({ accountId, playerStatus, socket, teamNumber: 0 });
      this.teams[0].playersInTeam.push({ accountId, playerStatus, socket, teamNumber: 0 });
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
      if (this.players.length === 0) {
        this.endGame();
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

  validateMessageLength(msg: ChatMessage): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

  bindLobbyEndPoints(socket: Socket) {

    // bind other lobby relevant endpoints here <----- StartGame and such

    socket.on(SocketDrawing.START_PATH, (startPoint: Coord, brushInfo: BrushInfo) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.startPath(startPoint, brushInfo)
          .then((startedPath) => {
            this.io.in(this.lobbyId).emit(SocketDrawing.START_PATH_BC, startedPath.id, startPoint, startedPath.brushInfo);
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

    socket.on(SocketDrawing.ERASE_ID, (id: number) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.erase(id)
          .then(() => {
            this.io.in(this.lobbyId).emit(SocketDrawing.ERASE_ID_BC, id);
          })
          .catch(() => {
            console.log(`failed to start erase for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketDrawing.ADD_PATH, (id: number) => {
      if (this.isActivePlayer(socket)) {
        this.drawingCommands.addPath(id)
          .then((addedPath) => {
            this.io.in(this.lobbyId).emit(SocketDrawing.ADD_PATH_BC, addedPath.id, addedPath.path, addedPath.brushInfo);
          })
          .catch(() => {
            console.log(`failed to update erase for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketMessages.SET_GAME_PRIVACY, (privacySetting: boolean) => {
      this.setPrivacySetting(socket.id, privacySetting);
      this.io.in(this.lobbyId).emit(SocketMessages.EMIT_NEW_PRIVACY_SETTING, this.privateLobby);
    });

    socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
      if (this.validateMessageLength(sentMsg)) {
        socket.to(this.lobbyId).broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
      }
      else {
        console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
      }
    });

    socket.on(SocketMessages.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        this.io.in(this.lobbyId).emit(SocketMessages.START_GAME_CLIENT);
        this.currentGameState = CurrentGameState.IN_GAME;
      }
    });

  }

  unbindLobbyEndPoints(socket: Socket) {
    socket.removeAllListeners(SocketDrawing.START_PATH);
    socket.removeAllListeners(SocketDrawing.UPDATE_PATH);
    socket.removeAllListeners(SocketDrawing.END_PATH);
    socket.removeAllListeners(SocketDrawing.ERASE_ID);
    socket.removeAllListeners(SocketDrawing.ERASE_ID_BC);
    socket.removeAllListeners(SocketDrawing.ADD_PATH);
    socket.removeAllListeners(SocketDrawing.ADD_PATH_BC);
    socket.removeAllListeners(SocketMessages.SET_GAME_PRIVACY);
    socket.removeAllListeners(SocketMessages.SEND_MESSAGE);
    socket.removeAllListeners(SocketMessages.PLAYER_GUESS);
    socket.removeAllListeners(SocketMessages.START_GAME_SERVER);
  }
}