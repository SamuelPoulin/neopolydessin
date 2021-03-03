export abstract class Command {

  abstract do(): void;
  abstract undo(): void;

}