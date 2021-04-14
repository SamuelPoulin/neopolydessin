import { Injectable } from '@angular/core';

export enum TutorialStep {
  START,
  CREATE_GAME,
  CHOOSE_SETTINGS,
  START_GAME,
  SELECT_TOOL,
  DRAW,
  TUTORIAL_END,
  END,
}

@Injectable({
  providedIn: 'root',
})
export class TutorialService {
  static readonly TUTORIAL_ANIMATION_DELAY: number = 250;

  tutorialActive: boolean;
  showingHelp: boolean;
  highlightedElement: HTMLElement | null;
  oldZIndex: string;
  oldBorder: string;
  currentStep: TutorialStep;
  currentHint: string;

  constructor() {
    this.tutorialActive = false;
    this.showingHelp = false;
    this.highlightedElement = null;
    this.oldZIndex = '0';
    this.oldBorder = 'none';
    this.currentStep = TutorialStep.START;
    this.currentHint = '';
  }

  startTutorial() {
    this.tutorialActive = true;
    this.next(TutorialStep.CREATE_GAME);
  }

  completeTutorial() {
    this.tutorialActive = false;
    this.clearHighlight();
    this.currentStep = TutorialStep.START;
  }

  next(step: TutorialStep) {
    this.currentStep = step;
    console.log(step);
    switch (this.currentStep) {
      case TutorialStep.CREATE_GAME: {
        this.highlightElement('#create-game-button');
        this.currentHint = 'Bienvenue dans le tutoriel de PolyDessin! Pour créer une partie, cliquez sur ce bouton.';
        break;
      }
      case TutorialStep.CHOOSE_SETTINGS: {
        this.highlightElement('#create-game-modal-button');
        this.currentHint =
          'Vous pouvez maintenant choisir les options de la partie. ' +
          'Nous allons créer une partie solo, cliquez sur ce bouton pour créer un lobby.';
        break;
      }
      case TutorialStep.START_GAME: {
        this.highlightElement('#start-button');
        this.currentHint = 'En mode solo, un joueur virtuel rejoint votre équipe. Cliquez sur ce bouton pour commencer la partie.';
        break;
      }
      case TutorialStep.SELECT_TOOL: {
        this.highlightElement('#btn-pen-tool');
        this.currentHint = "La partie est commencée! Cliquez l'outil crayon pour commencer à dessiner.";
        break;
      }
      case TutorialStep.DRAW: {
        this.highlightElement('#drawing-surface');
        this.currentHint = 'Vous pouvez maintenant dessiner! Faites votre premier trait sur la surface de dessin.';
        break;
      }
      case TutorialStep.TUTORIAL_END: {
        this.highlightElement('#quit-game-button');
        this.currentHint = 'Vous avez complété le tutoriel. Cliquez sur ce bouton pour quitter la partie.';
        break;
      }
      case TutorialStep.END: {
        this.completeTutorial();
        break;
      }
    }
  }

  highlightElement(selector: string) {
    this.clearHighlight();
    setTimeout(() => {
      this.showingHelp = true;
      const element = document.querySelector<HTMLElement>(selector);
      if (element) {
        this.highlightedElement = element;
        this.oldZIndex = element.style.zIndex;
        this.oldBorder = element.style.border;
        element.style.position = 'relative';
        element.style.zIndex = '2001';
        element.style.border = '3px solid red';
      }
    }, TutorialService.TUTORIAL_ANIMATION_DELAY);
  }

  clearHighlight() {
    this.showingHelp = false;
    this.currentHint = '';
    if (this.highlightedElement) {
      this.highlightedElement.style.zIndex = this.oldZIndex;
      this.highlightedElement.style.border = this.oldBorder;
      this.highlightedElement = null;
    }
  }
}
