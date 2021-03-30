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
import { CurrentGameState, Difficulty, GameType, LobbyInfo, Player, PlayerRole } from '../../common/communication/lobby';
import { ChatMessage, Message } from '../../common/communication/chat-message';
import { Coord } from './commands/path';

export interface ServerPlayer extends Player {
  socket: Socket;
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
  readonly TIME_ADD_CORRECT_GUESS: number = 30;

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
  protected drawingCommands: DrawingService;
  protected timeLeftSeconds: number;

  protected players: ServerPlayer[];
  protected teams: {
    teamNumber: number;
    currentScore: number;
    playersInTeam: ServerPlayer[];
  }[];

  constructor(
    @inject(Types.SocketIdService) protected socketIdService: SocketIdService,
    @inject(Types.DatabaseService) protected databaseService: DatabaseService,
    @inject(Types.PictureWordService) protected pictureWordService: PictureWordService,
    io: Server,
    accountId: string,
    difficulty: Difficulty,
    privacySetting: boolean,
    lobbyName: string
  ) {
    this.io = io;
    this.ownerAccountId = accountId;
    this.databaseService.getAccountById(accountId).then((account) => {
      this.ownerUsername = account.documents.username;
    });
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

  toLobbyInfo(): Player[] {
    return this.players.map((player) => {
      return this.serverPlayerToPlayer(player);
    });
  }

  getLobbySummary(): LobbyInfo {
    return {
      lobbyId: this.lobbyId,
      lobbyName: this.lobbyName,
      ownerUsername: this.ownerUsername,
      nbPlayerInLobby: this.players.length,
      gameType: this.gameType
    };
  }

  serverPlayerToPlayer(serverPlayer: ServerPlayer): Player {
    return {
      accountId: serverPlayer.accountId,
      username: serverPlayer.username,
      avatarId: serverPlayer.avatarId,
      playerRole: serverPlayer.playerRole,
      teamNumber: serverPlayer.teamNumber,
      isBot: serverPlayer.isBot,
    };
  }

  removePlayer(accountId: string, socket: Socket) {
    const index = this.players.findIndex((player) => player.accountId === accountId);
    if (index > -1) {
      const teamIndex = this.teams[this.players[index].teamNumber].playersInTeam.findIndex(((player) => player.accountId === accountId));
      if (teamIndex > -1) {
        this.teams[this.players[index].teamNumber].playersInTeam.splice(teamIndex, 1);
      }
      const removedPlayer = this.players[index];
      this.players.splice(index, 1);
      this.unbindLobbyEndPoints(socket);
      socket.to(this.lobbyId)
        .broadcast
        .emit(SocketMessages.PLAYER_DISCONNECTION, this.serverPlayerToPlayer(removedPlayer), Date.now());
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

  findPlayerById(accountId: string): Player | undefined {
    return this.players.find((player) => player.accountId === accountId);
  }

  lobbyHasRoom(): boolean {
    return this.players.length < this.size;
  }

  // todo remove playerRole sometime
  protected async addPlayerToTeam(playerId: string, playerRole: PlayerRole, socket: Socket, teamNumber: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.databaseService.getAccountById(playerId)
        .then((account) => {
          const playerName = account.documents.username;
          const player: ServerPlayer = {
            accountId: playerId,
            username: playerName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            avatarId: account.documents.avatar ? (account.documents.avatar as any)._id : null,
            playerRole,
            socket,
            teamNumber,
            isBot: false
          };
          this.players.push(player);
          this.teams[teamNumber].playersInTeam.push(player);
          socket.join(this.lobbyId);
          socket.to(this.lobbyId)
            .broadcast
            .emit(SocketMessages.PLAYER_CONNECTION, this.serverPlayerToPlayer(player), Date.now());
          this.io
            .in(this.lobbyId)
            .emit(SocketLobby.RECEIVE_LOBBY_INFO, this.toLobbyInfo());
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  protected bindLobbyEndPoints(socket: Socket) {

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
    socket.removeAllListeners(SocketLobby.PLAYER_GUESS);
    socket.removeAllListeners(SocketLobby.START_GAME_SERVER);
  }

  protected findPlayerBySocket(socket: Socket): Player | undefined {
    return this.players.find((player) => player.socket.id === socket.id);
  }

  protected endGame(): void {
    this.currentGameState = CurrentGameState.GAME_OVER;
    this.io.in(this.lobbyId).emit(SocketLobby.END_GAME);
    SocketIo.GAME_SUCCESSFULLY_ENDED.notify(this.lobbyId);
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
    const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socketId);
    if (senderAccountId === this.ownerAccountId) {
      this.privateLobby = newPrivacySetting;
    }
  }

  private validateMessageLength(msg: Message): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

  abstract addPlayer(playerId: string, role: PlayerRole, socket: Socket): void;

}