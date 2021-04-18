import { Injectable } from '@angular/core';
import confetti, { Options } from 'canvas-confetti';

export enum GameSound {
  CLAP = 'clap.mp3',
  AWW = 'aww.mp3',
  CHAT_NOTIFICATION = 'chat-message.ogg',
  INVITATION_RECEIVED = 'invite-received.ogg',
}

interface ConfettiXRange {
  beginning: number;
  end: number;
}

@Injectable({ providedIn: 'root' })
export class AudiovisualService {
  readonly confettiDefaults: Options = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  readonly confettiCount: number = 50;
  readonly confettiDuration: number = 5000;
  readonly confettiInterval: number = 250;
  readonly confettiY: number = 0.2;
  readonly confettiX1: ConfettiXRange = { beginning: 0.1, end: 0.3 };
  readonly confettiX2: ConfettiXRange = { beginning: 0.7, end: 0.9 };

  randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  playSound(sound: GameSound) {
    const audio = new Audio();
    audio.src = `assets/audio/${sound}`;
    audio.volume = 0.05;
    audio.load();
    audio.play();
  }

  celebrate() {
    this.playSound(GameSound.CLAP);
    this.throwConfetti();
  }

  cry() {
    this.playSound(GameSound.AWW);
  }

  throwConfetti() {
    const animationEnd = Date.now() + this.confettiDuration;

    const animation = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(animation);
      }

      const particleCount = this.confettiCount * (timeLeft / this.confettiDuration);
      confetti(
        Object.assign({}, this.confettiDefaults, {
          particleCount,
          origin: {
            x: this.randomInRange(this.confettiX1.beginning, this.confettiX1.end),
            y: Math.random() - this.confettiY,
          },
        }),
      );
      confetti(
        Object.assign({}, this.confettiDefaults, {
          particleCount,
          origin: {
            x: this.randomInRange(this.confettiX2.beginning, this.confettiX2.end),
            y: Math.random() - this.confettiY,
          },
        }),
      );
    }, this.confettiInterval);
  }

  fire(particleRatio: number, opts: Options) {
    confetti(
      Object.assign({}, this.confettiDefaults, opts, {
        particleCount: Math.floor(this.confettiCount * particleRatio),
      }),
    );
  }
}
