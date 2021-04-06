import { Logins } from '../../server/models/schemas/logins';
import { Game } from '../../server/models/schemas/game-history';

export interface DashBoardInfo {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    logins: Logins;
    gameHistory: GameHistoryDashBoard;
    createdDate: number;
    avatar: string;
}

export interface GameHistoryDashBoard {
    games: Game[];
    nbGamePlayed: number;
    winPercentage: number;
    averageGameTime: number;
    totalTimePlayed: number;
    bestScoreSolo: number;
    bestScoreCoop: number;
}