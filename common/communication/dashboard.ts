import { Login } from '../../server/models/schemas/logins';
import { GameHistory } from '../../server/models/schemas/game-history';

export interface DashBoardInfo {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    logins: Login[];
    gameHistory: GameHistoryDashBoard;
    createdDate: number;
    avatar: string;
}

export interface GameHistoryDashBoard extends GameHistory {
    nbGamePlayed: number;
    winPercentage: number;
    averageGameTime: number;
    totalTimePlayed: number;
    bestScoreSolo: number;
    bestScoreCoop: number;
}