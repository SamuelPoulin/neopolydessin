import { inject } from "inversify";
import types from "../app/types";

export class Lobby {

  lobbyId: string;
  size: number;
  players: string[];
  gameType: string;

}