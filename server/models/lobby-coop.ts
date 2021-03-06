import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class LobbyCoop extends Lobby {}