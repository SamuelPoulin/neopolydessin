import { ObjectId } from 'mongodb';
import { Document, Model, model, Query, Schema } from 'mongoose';
import { GameType } from '../../../common/communication/lobby';

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
  team: [Team];
}

export interface Team {
  score: number;
  playerNames: string[];
}

export interface GameHistory extends Document {
  _id: ObjectId;
  accountId: string;
  games: [Game];
}

interface GameHistoryModel extends Model<GameHistory> {
  findByAccountId: (id: string) => Query<GameHistory | null, GameHistory>;
}

export const gameHistorySchema = new Schema<GameHistory, GameHistoryModel>({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  games: [{
    _id: false,
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    gameType: GameType,
    team: [{
      _id: false,
      score: Number,
      playerNames: [String]
    }]
  }]
});

gameHistorySchema.statics.findByAccountId = (accountId: string) => {
  return gameHistoryModel.findOne({ accountId });
};

const gameHistoryModel = model<GameHistory, GameHistoryModel>('GameHistory', gameHistorySchema);
export default gameHistoryModel;