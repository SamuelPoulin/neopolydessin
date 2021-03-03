import { NOT_IMPLEMENTED } from 'http-status-codes';
import { Command } from './command';
import { Path } from './Path';
export class DrawCommand extends Command {

  path: Path;

  constructor(path: Path) {
    super();
    this.path = path;
  }

  do(): void {
    throw NOT_IMPLEMENTED;
  }

  undo(): void {
    throw NOT_IMPLEMENTED;
  }
}