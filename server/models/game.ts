import { Lobby } from './lobby';

export interface Game extends Lobby {
  playerDrawing: string;
  currentWordToGuess: string;
}