import { Socket } from '../../server/node_modules/socket.io';

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