import { EventEmitter } from 'events';
import { Command } from './command';

export class CommandReceiver extends EventEmitter {
  private static readonly EVENT_TEXT: string = 'action';

  private _commands: Command[];
  private _revertedCommands: Command[];

  get canUndo(): boolean {
    return this._commands.length > 0;
  }

  get canRedo(): boolean {
    return this._revertedCommands.length > 0;
  }

  constructor() {
    super();
    this._commands = new Array<Command>();
    this._revertedCommands = new Array<Command>();
  }

  add(command: Command): void {
    this._revertedCommands = new Array<Command>();
    this._commands.push(command);
    command.execute();
    this.emit(CommandReceiver.EVENT_TEXT);
  }

  undo(): void {
    const command = this._commands.pop();
    if (command) {
      this._revertedCommands.push(command);
      command.undo();
      this.emit(CommandReceiver.EVENT_TEXT);
    }
  }

  redo(): void {
    const command = this._revertedCommands.pop();
    if (command) {
      this._commands.push(command);
      command.execute();
      this.emit(CommandReceiver.EVENT_TEXT);
    }
  }

  clear(): void {
    this._commands.length = 0;
    this._revertedCommands.length = 0;
  }
}
