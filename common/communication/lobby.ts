import { ChatMessage } from "./chat-message";

export interface LobbyInfo {
  lobbyId: string;
  lobbyName: string;
  ownerUsername: string;
  nbPlayerInLobby: number;
  gameType: GameType;
}

export interface Player {
  accountId: string;
  username: string;
  avatarId: string;
  playerStatus: PlayerStatus;
  teamNumber: number;
  isBot: boolean;
  finishedLoading: boolean;
}

export interface PlayerInfo {
  teamNumber: number
  playerName: string
  accountId: string
  avatar: string
}

export interface PlayerRole {
  playerName: string;
  playerStatus: PlayerStatus;
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