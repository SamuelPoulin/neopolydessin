import { GameType } from './lobby';

export enum GameResult {
    WIN = 'Win',
    LOSE = 'Lose',
    NEUTRAL = 'Neutral'
}

export interface Game {
    gameResult: GameResult;
    startDate: number;
    endDate: number;
    gameType: GameType;
    team: Team[];
}

export interface Team {
    score: number;
    playerNames: string[];
}


export interface Logins {
    start: number;
    end?: number;
}

export interface DashBoardInfo {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    logins: Logins[];
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