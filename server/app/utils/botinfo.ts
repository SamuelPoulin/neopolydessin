import { Server } from 'socket.io';
import { ChatMessage } from '../../../common/communication/chat-message';
import { Difficulty } from '../../../common/communication/lobby';
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
  requestHintOnCooldown: string;
  noMoreHints: string;
  guessLeftMessage: (guessTries: number, guessLeft: number) => string;
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
      requestHintOnCooldown: 'Je viens de vous en donner un...',
      noMoreHints: 'J\'ai rien d\'autre à vous donner',
      guessLeftMessage: (guessTries: number, guessLeft: number) => {
        return `Il reste ${guessLeft} essai sur ${guessTries}`;
      }
    }
  ],
  [
    Personnalities.GENTLEMAN, {
      onStartDraw: 'Attention mesdames et messieurs, nous allons commencer!',
      onSlowDown: 'Je vais ralentir un peu, je suis à bout de souffle.',
      onSpeedUp: 'Augmentons la vitesse du jeu!',
      onResetDrawing: 'Allons-y pour un autre si cela ne vous derange pas?',
      onPlayerCorrectGuess: 'Fabuleux! Il s\'agit d\'une observation astucieuse!',
      onPlayerCloseGuess: 'Dommage, vous étiez si proche de la bonne réponse...',
      onPlayerIncorrectGuess: 'Ce n\'est pas exactement ce qu\'on recherche, malheureusement.',
      onPlayerRequestsHint: 'Il me fait plaisir de vous donner un indice, nous sommes dans la même équipe!',
      requestHintOnCooldown: 'Malheureusement, cela fait peu de temps que je vous ai donné un indice.',
      noMoreHints: 'Je vous ai aidé au maximum des mes capacités',
      guessLeftMessage: (guessTries: number, guessLeft: number) => {
        return `Faites attention, il vous reste ${guessLeft} essai sur ${guessTries}`;
      }

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
      onPlayerRequestsHint: '*Donne un indice*',
      requestHintOnCooldown: '🙈 Attend le temps de rechargement!!',
      noMoreHints: '(Ｔ▽Ｔ) J\'ai aucun autre indice',
      guessLeftMessage: (guessTries: number, guessLeft: number) => {
        return `Haaaaaaaaaaaa il reste ${guessLeft} essai sur ${guessTries}!!!`;
      }
    }
  ]
]);

const HARD_DELAY: number = 5;
const INTERMEDIATE_DELAY: number = 15;
const EASY_DELAY: number = 25;
const SPEED_MOD: number = -10;

const DIFFICULTY_SPEEDS: Map<Difficulty, number> = new Map([
  [Difficulty.EASY, EASY_DELAY],
  [Difficulty.INTERMEDIATE, INTERMEDIATE_DELAY],
  [Difficulty.HARD, HARD_DELAY]
]);

const PERCENT_1: number = 0.01;
const PERCENT_20: number = 0.2;
const PERCENT_30: number = 0.3;
const PERCENT_50: number = 0.5;
export class BotPersonnality {


  name: string;
  drawDelay: number;

  hints: string[];
  hintIndex: number;

  private baseDrawDelay: number;
  private sentences: BotSentences;

  constructor(
    private io: Server,
    private lobbyId: string,
    private difficulty: Difficulty,
  ) {
    this.baseDrawDelay = DIFFICULTY_SPEEDS.get(difficulty) as number;
    this.drawDelay = this.baseDrawDelay;
    this.name = this.getBotUsername();
    this.sentences = this.getBotPersonnality();
  }

  onStartDraw() {
    if (Math.random() < PERCENT_20) {
      this.sendBotMessage(this.sentences.onStartDraw);
      const newSpeed = (this.baseDrawDelay + SPEED_MOD);
      this.drawDelay = newSpeed < 0 ? HARD_DELAY : newSpeed;
    }
  }

  onStartSegment() {
    if (this.difficulty !== Difficulty.HARD) {
      if (Math.random() < PERCENT_1 && this.drawDelay !== this.baseDrawDelay) {
        this.sendBotMessage(this.sentences.onSlowDown);
        this.drawDelay = this.baseDrawDelay;
      } else if (Math.random() < PERCENT_1 && this.drawDelay === this.baseDrawDelay) {
        this.sendBotMessage(this.sentences.onSpeedUp);
        const newSpeed = (this.baseDrawDelay + SPEED_MOD);
        this.drawDelay = newSpeed < 0 ? HARD_DELAY : newSpeed;
      }
    }
  }

  onResetDrawing() {
    if (Math.random() < PERCENT_20) {
      this.sendBotMessage(this.sentences.onResetDrawing);
    }
  }

  onPlayerCorrectGuess(guessTries?: number, guessLeft?: number) {
    if (Math.random() < PERCENT_30) {
      this.sendBotMessage(this.sentences.onPlayerCorrectGuess);
    }
  }

  onPlayerCloseGuess(guessTries?: number, guessLeft?: number) {
    if (Math.random() < PERCENT_50) {
      this.sendBotMessage(this.sentences.onPlayerCloseGuess);
    }
    if (guessTries && guessLeft) {
      this.sendBotMessage(this.sentences.guessLeftMessage(guessTries, guessLeft));
    }
  }

  onPlayerIncorrectGuess(guessTries?: number, guessLeft?: number) {
    if (Math.random() < PERCENT_50) {
      this.sendBotMessage(this.sentences.onPlayerIncorrectGuess);
    }
    if (guessTries && guessLeft) {
      this.sendBotMessage(this.sentences.guessLeftMessage(guessTries, guessLeft));
    }
  }

  onPlayerRequestsHint() {
    if (this.hintsLeft()) {
      this.sendBotMessage(this.sentences.onPlayerRequestsHint + ` ${this.hints[this.hintIndex]}`);
      this.hintIndex++;
    }
  }

  requestHintOnCooldown() {
    this.sendBotMessage(this.sentences.requestHintOnCooldown);
  }

  noMoreHints() {
    this.sendBotMessage(this.sentences.noMoreHints);
  }

  hintsLeft() {
    return this.hintIndex < this.hints.length;
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