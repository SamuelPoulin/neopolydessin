/*tslint:disable:no-string-literal*/
import { Command } from './command';
import { CommandReceiver } from './command-receiver';

export class MockCommand implements Command {
  execute(): void {
    return;
  }
  undo(): void {
    return;
  }
}

describe('CommandReceiver', () => {
  let commandReceiver: CommandReceiver;

  beforeEach(() => {
    commandReceiver = new CommandReceiver();
  });

  it('can add and execute a command', () => {
    const command = new MockCommand();
    const executeSpy = spyOn(command, 'execute');
    commandReceiver.add(command);
    expect(commandReceiver['_revertedCommands'].length).toEqual(0);
    expect(commandReceiver['_commands'].length).toEqual(1);
    expect(executeSpy).toHaveBeenCalled();
  });

  it('can undo last command', () => {
    const command = new MockCommand();
    const undoSpy = spyOn(command, 'undo');
    commandReceiver.add(command);
    commandReceiver.undo();
    expect(commandReceiver['_revertedCommands'].length).toEqual(1);
    expect(commandReceiver['_commands'].length).toEqual(0);
    expect(undoSpy).toHaveBeenCalled();
  });

  it('can redo last undone command', () => {
    const command = new MockCommand();
    const executeSpy = spyOn(command, 'execute');
    commandReceiver.add(command);
    commandReceiver.undo();
    commandReceiver.redo();
    expect(commandReceiver['_revertedCommands'].length).toEqual(0);
    expect(commandReceiver['_commands'].length).toEqual(1);
    expect(executeSpy).toHaveBeenCalledTimes(2);
  });

  it('canUndo if as commands', () => {
    const command = new MockCommand();
    expect(commandReceiver.canUndo).toEqual(false);
    commandReceiver.add(command);
    expect(commandReceiver.canUndo).toEqual(true);
  });

  it('canRedo if as reverted commands', () => {
    const revertedCommand = new MockCommand();
    expect(commandReceiver.canRedo).toEqual(false);
    commandReceiver['_revertedCommands'].push(revertedCommand);
    expect(commandReceiver.canRedo).toEqual(true);
  });
});
