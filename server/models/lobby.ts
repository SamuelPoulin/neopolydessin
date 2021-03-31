/* eslint-disable max-lines */
import { inject, injectable } from 'inversify';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { PictureWordService } from '../app/services/picture-word.service';
import { DrawingService } from '../app/services/drawing.service';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { BrushInfo } from '../../common/communication/brush-info';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { SocketIdService } from '../app/services/socket-id.service';
import Types from '../app/types';
import { SocketIo } from '../app/socketio';
import { DatabaseService } from '../app/services/database.service';
import {
  CurrentGameState,
  Difficulty,
  Entity,
  GameType,
  instanceOfPlayer,
  LobbyInfo,
  Player,
  PlayerRole,
  ReasonEndGame,
  TeamScore
} from '../../common/communication/lobby';
import { ChatMessage, Message } from '../../common/communication/chat-message';
import { Coord } from './commands/path';

export interface ServerPlayer extends Player {
  socket: Socket;
}

const DEFAULT_TEAM_SIZE: number = 4;
const SOLO_TEAM_SIZE: number = 2;

@injectable()
export abstract class Lobby {

  readonly MAX_LENGTH_MSG: number = 200;
  readonly MS_PER_SEC: number = 1000;
  readonly TIME_ADD_CORRECT_GUESS: number = 30;
  readonly GAME_SIZE_MAP: Map<GameType, number> = new Map<GameType, number>([
    [GameType.CLASSIC, DEFAULT_TEAM_SIZE],
    [GameType.SPRINT_SOLO, SOLO_TEAM_SIZE],
    [GameType.SPRINT_COOP, DEFAULT_TEAM_SIZE]
  ]);

  lobbyId: string;
  gameType: GameType;
  difficulty: Difficulty;
  privateLobby: boolean;
  lobbyName: string;

  protected io: Server;
  protected clockTimeout: NodeJS.Timeout;

  protected size: number;
  protected wordToGuess: string;
  protected currentGameState: CurrentGameState;
  protected drawingCommands: DrawingService;
  protected timeLeftSeconds: number;

  protected players: Entity[];
  protected teamScores: number[];

  constructor(
    @inject(Types.SocketIdService) protected socketIdService: SocketIdService,
    @inject(Types.DatabaseService) protected databaseService: DatabaseService,
    @inject(Types.PictureWordService) protected pictureWordService: PictureWordService,
    io: Server,
    difficulty: Difficulty,
    privacySetting: boolean,
    lobbyName: string
  ) {
    this.io = io;
    this.difficulty = difficulty;
    this.privateLobby = privacySetting;
    this.lobbyName = lobbyName;
    this.lobbyId = uuidv4();
    this.wordToGuess = '';
    this.currentGameState = CurrentGameState.LOBBY;
    this.drawingCommands = new DrawingService();
    this.timeLeftSeconds = 0;
    this.players = [];
    this.teamScores = [];
  }

  toLobbyInfo(): Player[] {
    return this.players.map((player) => {
      return this.toPlayer(player);
    });
  }

  getLobbySummary(): LobbyInfo {
    const owner = this.getLobbyOwner();
    return {
      lobbyId: this.lobbyId,
      lobbyName: this.lobbyName,
      ownerUsername: owner ? owner.username : 'Jesus',
      nbPlayerInLobby: this.players.length,
      gameType: this.gameType
    };
  }

  getLobbyOwner(): ServerPlayer | undefined {
    return this.players.find((player) => !player.isBot && (player as Player).isOwner) as ServerPlayer;
  }

  toPlayer(player: Entity): Player {
    return {
      accountId: instanceOfPlayer(player) ? (player as Player).accountId : null,
      avatarId: instanceOfPlayer(player) ? (player as Player).avatarId : null,
      finishedLoading: instanceOfPlayer(player) ? (player as Player).finishedLoading : null,
      username: player.username,
      playerRole: player.playerRole,
      teamNumber: player.teamNumber,
      isBot: player.isBot,
      isOwner: player.isOwner
    };
  }

  removePlayer(accountId: string, socket: Socket) {
    const index = this.players.findIndex((player) => !player.isBot && (player as Player).accountId === accountId);
    if (index > -1) {
      const removedPlayer = this.players[index];
      this.players.splice(index, 1);
      this.unbindLobbyEndPoints(socket);
      if (removedPlayer.isOwner) {
        this.players[0].isOwner = true;
      }
      socket.leave(this.lobbyId);
      this.emitLeaveInfo(removedPlayer, socket);
      if (this.players.length === 0 || this.currentGameState !== CurrentGameState.LOBBY) {
        this.endGame(ReasonEndGame.PLAYER_DISCONNECT);
      }
    }
  }

  findPlayerById(accountId: string): Player | undefined {
    return this.players.find((player) => !player.isBot && (player as Player).accountId === accountId) as Player;
  }

  lobbyHasRoom(): boolean {
    return this.players.length < this.size;
  }

  protected async addPlayerToTeam(playerId: string, socket: Socket, teamNumber: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.databaseService.getAccountById(playerId)
        .then((account) => {
          const playerName = account.documents.username;
          const player: ServerPlayer = {
            accountId: playerId,
            username: playerName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            avatarId: account.documents.avatar ? (account.documents.avatar as any)._id : null,
            playerRole: PlayerRole.PASSIVE,
            socket,
            teamNumber,
            isBot: false,
            finishedLoading: false,
            isOwner: this.players.length === 0 ? true : false
          };
          this.players.push(player);
          socket.join(this.lobbyId);
          this.emitJoinInfo(player, socket);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  protected emitLeaveInfo(removedPlayer: Entity, socket: Socket): void {
    socket.to(this.lobbyId).broadcast
      .emit(SocketMessages.PLAYER_DISCONNECTION, this.toPlayer(removedPlayer), Date.now());
    this.io.in(this.lobbyId)
      .emit(SocketLobby.RECEIVE_LOBBY_INFO, this.toLobbyInfo());
  }

  protected emitJoinInfo(player: Entity, socket: Socket): void {
    socket.to(this.lobbyId).broadcast
      .emit(SocketMessages.PLAYER_CONNECTION, this.toPlayer(player), Date.now());
    this.io.in(this.lobbyId)
      .emit(SocketLobby.RECEIVE_LOBBY_INFO, this.toLobbyInfo());
  }

  protected bindLobbyEndPoints(socket: Socket) {

    socket.on(SocketLobby.ADD_BOT, (teamNumber: number) => {
      const owner = this.getLobbyOwner();
      if (owner && owner.socket.id === socket.id) {
        const bot: Entity = {
          username: 'bob',
          playerRole: PlayerRole.PASSIVE,
          teamNumber,
          isBot: true,
          isOwner: false
        };
        this.players.push(bot);
        this.emitJoinInfo(bot, socket);
      }
    });

    socket.on(SocketLobby.REMOVE_BOT, (username: string) => {
      const owner = this.getLobbyOwner();
      if (owner && owner.socket.id === socket.id) {
        const indexOfBotToRemove = this.players.findIndex((player) => player.isBot && player.username === username);
        if (indexOfBotToRemove > -1) {
          const removedBot = this.players.splice(indexOfBotToRemove, 1)[0];
          this.emitLeaveInfo(removedBot, socket);
        }
      }
    });

    socket.on(SocketLobby.START_GAME_SERVER, () => {
      const owner = this.getLobbyOwner();
      if (owner && owner.socket.id === socket.id) {
        this.currentGameState = CurrentGameState.IN_GAME;
        this.io.in(this.lobbyId).emit(SocketLobby.START_GAME_CLIENT, this.toLobbyInfo());
      }
    });

    socket.on(SocketDrawing.START_PATH, (startPoint: Coord, brushInfo: BrushInfo) => {
      if (this.isActivePlayer(socket) && this.gameIsInDrawPhase()) {
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
      if (this.isActivePlayer(socket) && this.gameIsInDrawPhase()) {
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
      if (this.isActivePlayer(socket) && this.gameIsInDrawPhase()) {
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
      if (this.isActivePlayer(socket) && this.gameIsInDrawPhase()) {
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
      if (this.isActivePlayer(socket) && this.gameIsInDrawPhase()) {
        this.drawingCommands.addPath(id)
          .then((addedPath) => {
            this.io.in(this.lobbyId).emit(SocketDrawing.ADD_PATH_BC, addedPath.id, addedPath.path, addedPath.brushInfo);
          })
          .catch(() => {
            console.log(`failed to update erase for ${this.lobbyId}`);
          });
      }
    });

    socket.on(SocketLobby.CHANGE_PRIVACY_SETTING, (privacySetting: boolean) => {
      this.setPrivacySetting(socket.id, privacySetting);
      this.io.in(this.lobbyId).emit(SocketLobby.CHANGED_PRIVACY_SETTING, this.privateLobby);
    });

    socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: Message) => {
      if (this.validateMessageLength(sentMsg)) {
        const player = this.findPlayerBySocket(socket);
        if (player) {
          const messageWithUsername: ChatMessage = {
            content: sentMsg.content,
            timestamp: Date.now(),
            senderUsername: player.username
          };
          this.io.in(this.lobbyId).emit(SocketMessages.RECEIVE_MESSAGE, messageWithUsername);
        }
      }
      else {
        console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
      }
    });

    socket.on(SocketLobby.LOADING_OVER, () => {
      const playerDoneLoading = this.findPlayerBySocket(socket);
      if (playerDoneLoading) {
        playerDoneLoading.finishedLoading = true;
      }
      if (this.everyPlayerIsLoaded()) {
        this.startGame();
      }
    });

    socket.on(SocketLobby.LEAVE_LOBBY, () => {
      const playerId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (playerId) {
        this.removePlayer(playerId, socket);
      }
    });

  }

  protected unbindLobbyEndPoints(socket: Socket) {
    socket.removeAllListeners(SocketDrawing.START_PATH);
    socket.removeAllListeners(SocketDrawing.UPDATE_PATH);
    socket.removeAllListeners(SocketDrawing.END_PATH);
    socket.removeAllListeners(SocketDrawing.ERASE_ID);
    socket.removeAllListeners(SocketDrawing.ERASE_ID_BC);
    socket.removeAllListeners(SocketDrawing.ADD_PATH);
    socket.removeAllListeners(SocketDrawing.ADD_PATH_BC);
    socket.removeAllListeners(SocketMessages.SEND_MESSAGE);
    socket.removeAllListeners(SocketLobby.CHANGE_PRIVACY_SETTING);
    socket.removeAllListeners(SocketLobby.START_GAME_SERVER);
    socket.removeAllListeners(SocketLobby.LOADING_OVER);
  }

  protected findPlayerBySocket(socket: Socket): Player | undefined {
    return this.players.find((player) => (player as ServerPlayer).socket.id === socket.id) as Player;
  }

  protected endGame(reason: ReasonEndGame): void {
    this.currentGameState = CurrentGameState.GAME_OVER;
    clearInterval(this.clockTimeout);
    this.io.in(this.lobbyId).emit(SocketLobby.END_GAME, reason);
    SocketIo.GAME_SUCCESSFULLY_ENDED.notify(this.lobbyId);
  }

  protected getTeamLength(teamNumber: number): number {
    return this.players.filter((player) => player.teamNumber === teamNumber).length;
  }

  protected getTeamsScoreArray(): TeamScore[] {
    const teamScoreArray: TeamScore[] = [];
    for (let i = 0; i < this.teamScores.length; i++) {
      teamScoreArray.push({
        teamNumber: i,
        score: this.teamScores[i],
      });
    }
    return teamScoreArray;
  }

  private gameIsInDrawPhase(): boolean {
    return this.currentGameState === CurrentGameState.DRAWING;
  }

  private isActivePlayer(socket: Socket): boolean {
    const playerInfo = this.findPlayerBySocket(socket);
    if (playerInfo) {
      return playerInfo.playerRole === PlayerRole.DRAWER;
    } else {
      return false;
    }
  }

  private setPrivacySetting(socketId: string, newPrivacySetting: boolean) {
    const owner = this.getLobbyOwner();
    if (owner && owner.socket.id === socketId) {
      this.privateLobby = newPrivacySetting;
    }
  }

  private validateMessageLength(msg: Message): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

  private everyPlayerIsLoaded(): boolean {
    return this.players.every((player) => (!player.isBot && (player as Player).finishedLoading) || player.isBot);
  }

  abstract addPlayer(playerId: string, socket: Socket): void;

  protected abstract startGame(): void;

  protected abstract startRoundTimer(): void;

}