import { HomeComponent } from '@components/pages/home/home/home.component';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { ModalType } from '@services/modal/modal-type.enum';

export class HomeKeyboardListener extends KeyboardListenerService {
  constructor(homeComponent: HomeComponent) {
    super();

    this.addEvents([
      [
        KeyboardListenerService.getIdentifier('o', true),
        () => {
          homeComponent.openModal(ModalType.CREATE);
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('g', true),
        () => {
          homeComponent.openGallery();
          return true;
        },
      ],
    ]);
  }
}
