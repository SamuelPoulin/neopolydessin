import { Server } from 'socket.io';
import { ChatMessage } from '../../../common/communication/chat-message';
import { SocketMessages } from '../../../common/socketendpoints/socket-messages';

const BOT_NAMES: string[] = [
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

enum Personnalities {
  AGGRESSIVE = 0,
  GENTLEMAN = 1,
  UWU = 2
}

export interface BotSentences {
  onStartDraw: string;
  onSpeedUp: string;
  onSlowDown: string;
  onResetDrawing: string;
  onPlayerCorrectGuess: string;
  onPlayerCloseGuess: string;
  onPlayerIncorrectGuess: string;
  onPlayerRequestsHint: string;
}

const PERSONNALITIES: Map<number, BotSentences> = new Map([
  [
    Personnalities.AGGRESSIVE, {
      onStartDraw: 'Êtes-vous prêts?',
      onSlowDown: 'Bon, je vais me calmer',
      onSpeedUp: 'On va plus vite!!',
      onResetDrawing: 'Un autre',
      onPlayerCorrectGuess: 'Finalement! C\'était pas si difficile?',
      onPlayerCloseGuess: 'Wow! Comment vous faites pour être aussi médiocre?',
      onPlayerIncorrectGuess: 'Vous êtes pas très bon... Pourtant mon dessin est clair.',
      onPlayerRequestsHint: 'Un indice... pour vrai?',
    }
  ],
  [
    Personnalities.GENTLEMAN, {
      onStartDraw: 'Attention mesdames et messieurs, la partie va commencer!',
      onSlowDown: 'Je vais ralentir un peu, je suis à bout de souffle.',
      onSpeedUp: 'Augmentons la vitesse du jeu!',
      onResetDrawing: 'Allons-y pour un autre si cela ne vous derange pas?',
      onPlayerCorrectGuess: 'Fabuleux! Il s\'agit d\'une observation astucieuse!',
      onPlayerCloseGuess: 'Dommage, vous étiez si proche de la bonne réponse...',
      onPlayerIncorrectGuess: 'Ce n\'est pas exactement ce qu\'on recherche, malheureusement.',
      onPlayerRequestsHint: 'Il me fait plaisir de vous donner un indice, nous sommes dans la même équipe!',
    }
  ],
  [
    Personnalities.UWU, {
      onStartDraw: 'On commence! ヾ(=`ω´=)ノ”',
      onSlowDown: '(u.u) ｡｡｡zzZ',
      onSpeedUp: '(( つ＞＜)つ',
      onResetDrawing: 'un autre!!!',
      onPlayerCorrectGuess: 'Bravo!  (=^-ω-^=)',
      onPlayerCloseGuess: 'C\'était proche! (> _ <) ',
      onPlayerIncorrectGuess: '(╯°□°）╯︵ ┻━┻',
      onPlayerRequestsHint: ''
    }
  ]
]);

const PERCENT_1: number = 0.01;
const PERCENT_20: number = 0.2;
const PERCENT_30: number = 0.3;
const PERCENT_50: number = 0.5;
const SPEED_DRAW_DELAY: number = 5;
const DEFAULT_DRAW_DELAY: number = 15;

export class BotPersonnality {


  name: string;
  drawDelay: number;

  hints: string[];
  hintIndex: number;
  private sentences: BotSentences;

  constructor(
    private io: Server,
    private lobbyId: string
  ) {
    this.name = this.getBotUsername();
    this.sentences = this.getBotPersonnality();
    console.log(this.sentences);
    this.drawDelay = DEFAULT_DRAW_DELAY;
  }

  onStartDraw() {
    if (Math.random() < PERCENT_20) {
      this.sendBotMessage(this.sentences.onStartDraw);
      this.drawDelay = SPEED_DRAW_DELAY;
    }
  }

  onStartSegment() {
    if (Math.random() < PERCENT_1 && this.drawDelay === SPEED_DRAW_DELAY) {
      this.sendBotMessage(this.sentences.onSlowDown);
      this.drawDelay = DEFAULT_DRAW_DELAY;
    } else if (Math.random() < PERCENT_1 && this.drawDelay === DEFAULT_DRAW_DELAY) {
      this.sendBotMessage(this.sentences.onSpeedUp);
      this.drawDelay = SPEED_DRAW_DELAY;
    }
  }

  onResetDrawing() {
    if (Math.random() < PERCENT_20) {
      this.sendBotMessage(this.sentences.onResetDrawing);
    }
  }

  onPlayerCorrectGuess() {
    if (Math.random() < PERCENT_30) {
      this.sendBotMessage(this.sentences.onPlayerCorrectGuess);
    }
  }

  onPlayerCloseGuess() {
    if (Math.random() < PERCENT_50) {
      this.sendBotMessage(this.sentences.onPlayerCloseGuess);
    }
  }

  onPlayerIncorrectGuess() {
    if (Math.random() < PERCENT_50) {
      this.sendBotMessage(this.sentences.onPlayerIncorrectGuess);
    }
  }

  onPlayerRequestsHint() {
    if (this.hintIndex < this.hints.length) {
      this.hintIndex++;
      this.sendBotMessage(this.sentences.onPlayerRequestsHint + ` ${this.hints[this.hintIndex]}`);
    }
  }

  private sendBotMessage(content: string): void {
    const messageWithUsername: ChatMessage = {
      content,
      timestamp: Date.now(),
      senderUsername: this.name
    };
    this.io.in(this.lobbyId).emit(SocketMessages.RECEIVE_MESSAGE, messageWithUsername);
  }

  private getBotUsername(): string {
    const random = Math.floor(Math.random() * BOT_NAMES.length);
    return BOT_NAMES[random];
  }

  private getBotPersonnality(): BotSentences {
    const index = Math.floor(Math.random() * PERSONNALITIES.size);
    return PERSONNALITIES.get(index) as BotSentences;
  }
};