export const BOT_NAMES: string[] = [
  'Samuel Q.',
  'Bob',
  'Jeanne',
  'Issam',
  'Kim',
  'Herminegille',
  'Maximilien',
  'Joséphine',
  'Cécile',
  'Marie-Louise'
];

export interface BotPersonnality {
  onStartDraw: () => void;
  onStartSegment: () => void;
  onResetDrawing: () => void;
  onPlayerCorrectGuess: () => void;
  onPlayerCloseGuess: () => void;
  onPlayerIncorrectGuess: () => void;
  onPlayerRequestsHint: () => void;
};