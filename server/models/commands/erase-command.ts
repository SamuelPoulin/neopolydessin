import { Command } from './command';
import { Path } from './path';
export class EraseCommand extends Command {

  eraserPath: Path;

  constructor(path: Path) {
    super();
    this.eraserPath = path;
  }

}