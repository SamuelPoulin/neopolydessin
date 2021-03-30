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
  playerRole: PlayerRole;
  teamNumber: number;
  isBot: boolean
}

export interface GuessMessage {
  content: string,
  timestamp: number,
  guessStatus: GuessResponse
}

export interface GuessMessageCoop extends GuessMessage {
  nbGuessLeft: number,
  guesserName: string
}

export interface GuessMessageClassique extends GuessMessage {
  guesserName: string
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