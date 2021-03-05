import { Command } from './command';
import { Path } from './Path';
export class EraseCommand extends Command {

  eraserPath: Path;

  constructor(path: Path) {
    super();
    this.eraserPath = path;
  }

}