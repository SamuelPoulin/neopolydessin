import { injectable } from 'inversify';
import { Command } from '../../models/commands/command';

@injectable()
export class DrawingCommands {

  doneCommands: Command[];

  undoneCommands: Command[];

  do(todo: Command) {
    this.doneCommands.push(todo);
    todo.do();
  }

  undo() {
    const commandToUndo = this.doneCommands.pop();
    if (commandToUndo) {
      commandToUndo.undo();
      this.undoneCommands.push(commandToUndo);
    }
  }

  redo() {
    const commandToRedo = this.undoneCommands.pop();
    if (commandToRedo) {
      commandToRedo.do();
      this.doneCommands.push(commandToRedo);
    }
  }

}