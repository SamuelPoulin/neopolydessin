import { Command } from './command';
import { Path } from './path';
export class DrawCommand extends Command {

  path: Path;

  constructor(path: Path) {
    super();
    this.path = path;
  }

}