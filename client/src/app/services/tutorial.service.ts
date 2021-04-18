import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EditorService } from './editor.service';
import { GameService } from './game.service';

export enum TutorialStep {
  START,
  CREATE_GAME,
  CHOOSE_SETTINGS,
  START_GAME,
  CHAT,
  GUESS_BUTTON,
  SEE_DRAWING,
  GUESS_DRAWING,
  SEE_GUESS,
  SELECT_TOOL,
  DRAW,
  DRAW_EXPLAIN,
  GAMEMODES_EXPLAIN,
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
  showContinue: boolean;
  highlightedElement: HTMLElement | null;
  oldZIndex: string;
  oldBorder: string;
  currentStep: TutorialStep;
  currentHint: string;

  tutorialStarted: EventEmitter<void>;

  constructor(private gameService: GameService, private editorService: EditorService, private router: Router) {
    this.tutorialActive = false;
    this.showingHelp = false;
    this.showContinue = false;
    this.highlightedElement = null;
    this.oldZIndex = '0';
    this.oldBorder = 'none';
    this.currentStep = TutorialStep.START;
    this.currentHint = '';

    this.tutorialStarted = new EventEmitter<void>();
  }

  startTutorial() {
    this.tutorialActive = true;
    this.next(TutorialStep.CREATE_GAME);
    this.tutorialStarted.emit();
  }

  completeTutorial() {
    this.tutorialActive = false;
    this.clearHighlight();
    this.currentStep = TutorialStep.START;
  }

  continue() {
    this.next(this.currentStep + 1);
  }

  next(step: TutorialStep) {
    this.currentStep = step;
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

      case TutorialStep.CHAT: {
        this.highlightElement('#chat-writer');
        this.showContinue = true;
        this.currentHint = 'Lorsque votre coéquipier vous fait un dessin, vous devez deviner le mot associé à ce dessin à travers le chat.';
        break;
      }
      case TutorialStep.GUESS_BUTTON: {
        this.highlightElement('#guess-button');
        this.showContinue = true;
        this.currentHint = 'Ce bouton permet de se mettre en mode devin.';
        break;
      }
      case TutorialStep.SEE_DRAWING: {
        this.highlightElement('#drawing-surface');
        this.showContinue = true;
        this.currentHint = 'Votre coéquipier vous a fait un dessin!';
        break;
      }
      case TutorialStep.GUESS_DRAWING: {
        this.highlightElement('#chat-writer');
        this.currentHint = "Activez le mode devin et essayez d'envoyer le mot associé.";
        break;
      }
      case TutorialStep.SEE_GUESS: {
        this.highlightElement('#chat-messages');
        this.showContinue = true;
        this.currentHint =
          'Votre essai a été envoyé! Une icône rouge annonce un essai erroné, ' +
          'une icône jaune annonce un essai près du but et une verte annonce que vous avez réussi à deviner le mot.';
        break;
      }
      case TutorialStep.SELECT_TOOL: {
        this.gameService.leaveGame();
        setTimeout(() => {
          this.editorService.isFreeEdit = true;
          this.router.navigate(['/edit']);
          this.highlightElement('#btn-pen-tool');
          this.currentHint = "C'est à votre tour de dessiner. Choisissez l'outil crayon.";
        });
        break;
      }
      case TutorialStep.DRAW: {
        this.highlightElement('#drawing-surface');
        this.showContinue = true;
        this.currentHint = 'Vous pouvez maintenant dessiner! Dessinez une pomme sur la surface de dessin.';
        break;
      }
      case TutorialStep.DRAW_EXPLAIN: {
        this.highlightElement('');
        this.showContinue = true;
        this.currentHint =
          'Lorsque vous jouez en mode classique avec un coéquipier humain, ' +
          "ce dernier devra deviner le mot associé à votre dessin. Il sera important de s'appliquer!";
        break;
      }
      case TutorialStep.GAMEMODES_EXPLAIN: {
        this.highlightElement('');
        this.showContinue = true;
        this.currentHint =
          'Le mode classique est un mode 2v2 où les joueurs de chaque équipe accumulent des points' +
          ' en espérant atteindre 5pts. Finalement, le mode Co-op est un mode à 5 joueurs où tous font partie de la ' +
          'même équipe et doivent deviner un dessin.';
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
    this.showContinue = false;
    this.currentHint = '';
    if (this.highlightedElement) {
      this.highlightedElement.style.zIndex = this.oldZIndex;
      this.highlightedElement.style.border = this.oldBorder;
      this.highlightedElement = null;
    }
  }
}
