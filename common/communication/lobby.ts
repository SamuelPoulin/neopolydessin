import { ChatMessage } from "./chat-message";

export interface LobbyInfo {
  lobbyId: string;
  lobbyName: string;
  ownerUsername: string;
  nbPlayerInLobby: number;
  gameType: GameType;
  maxSize: number;
}

export interface Player extends Entity {
  accountId: string | null;
  avatarId: string | null;
  finishedLoading: boolean | null;
}

export interface Entity {
  username: string;
  playerRole: PlayerRole;
  teamNumber: number;
  isBot: boolean;
  isOwner: boolean;
}

export const instanceOfEntity: (object: any) => boolean = (object: any): object is Entity => {
  return 'username' in object;
}

export const instanceOfPlayer: (object: any) => boolean = (object: any): object is Player => {
  return 'accountId' in object;
}

export interface TimeInfo {
  serverTime: number;
  timestamp: number;
}

export interface TeamScore {
  teamNumber: number,
  score: number
}

export interface GuessMessage extends ChatMessage {
  guessStatus: GuessResponse
}

export interface GuessMessageCoop extends GuessMessage {
  nbGuessLeft: number,
}

export enum GameType {
  CLASSIC = 'classic',
  SPRINT_SOLO = 'sprintSolo',
  SPRINT_COOP = 'sprintCoop'
}

export enum GuessResponse {
  CORRECT = 'correct',
  CLOSE = 'close',
  WRONG = 'wrong'
}

export enum ReasonEndGame {
  PLAYER_DISCONNECT = 'playerDisconnected',
  WINNING_SCORE_REACHED = 'winningScoreReached',
  TIME_RUN_OUT = 'timeRunOut'
}

export enum Difficulty {
  EASY = 'easy',
  INTERMEDIATE = 'intermediate',
  HARD = 'hard'
}

export enum PlayerRole {
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